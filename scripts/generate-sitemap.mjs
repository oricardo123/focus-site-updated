import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const rootDirectory = path.resolve(path.dirname(scriptPath), '..');

function attributeValue(tag, attribute) {
  const match = tag.match(new RegExp(`\\s${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match?.[1] ?? match?.[2] ?? null;
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

const pages = (await readdir(rootDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort((left, right) => left === 'index.html' ? -1 : right === 'index.html' ? 1 : left.localeCompare(right));

const canonicalUrls = [];
for (const page of pages) {
  const markup = await readFile(path.join(rootDirectory, page), 'utf8');
  const robotsTag = (markup.match(/<meta\b[^>]*>/gi) || []).find((tag) => attributeValue(tag, 'name')?.toLowerCase() === 'robots');
  if (/\bnoindex\b/i.test(attributeValue(robotsTag || '', 'content') || '')) continue;
  const canonicalTag = (markup.match(/<link\b[^>]*>/gi) || []).find((tag) => (attributeValue(tag, 'rel') || '').toLowerCase().split(/\s+/).includes('canonical'));
  const canonical = attributeValue(canonicalTag || '', 'href');
  if (!canonical) throw new Error(`${page}: canonical em falta; sitemap não gerado.`);
  const url = new URL(canonical);
  if (url.protocol !== 'https:' || url.search || url.hash) throw new Error(`${page}: canonical inválido (${canonical}).`);
  canonicalUrls.push(url.href);
}

if (new Set(canonicalUrls).size !== canonicalUrls.length) throw new Error('Existem canonicals duplicados; sitemap não gerado.');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...canonicalUrls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
  '</urlset>',
  ''
].join('\n');

await writeFile(path.join(rootDirectory, 'sitemap.xml'), sitemap);
console.log(`Sitemap gerado com ${canonicalUrls.length} URLs indexáveis.`);
