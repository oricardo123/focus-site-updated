import { execFile } from 'node:child_process';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(scriptPath), '..');
const textExtensions = new Set(['.html', '.js', '.mjs', '.css', '.xml', '.txt']);
const publishableAssetExtensions = new Set([
  '.avif', '.gif', '.ico', '.jpeg', '.jpg', '.mp4', '.otf', '.png', '.svg',
  '.ttf', '.webm', '.webp', '.woff', '.woff2'
]);
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules']);

function attributeValue(tag, attribute) {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\s${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function hasAttribute(tag, attribute) {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\s${escaped}(?:\\s*=|\\s|/?>)`, 'i').test(tag);
}

function openingTags(markup, name = '[a-z][\\w:-]*') {
  return markup.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
}

function normaliseReference(value) {
  return value.replaceAll('&amp;', '&').trim();
}

function isExternalReference(value) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value);
}

function metaTag(markup, attribute, value) {
  return openingTags(markup, 'meta').find((tag) => attributeValue(tag, attribute)?.toLowerCase() === value.toLowerCase());
}

function canonicalTag(markup) {
  return openingTags(markup, 'link').find((tag) => {
    const rel = attributeValue(tag, 'rel') || '';
    return rel.toLowerCase().split(/\s+/).includes('canonical');
  });
}

function pageIds(markup) {
  const ids = new Map();
  for (const tag of openingTags(markup)) {
    const id = attributeValue(tag, 'id');
    if (!id) continue;
    ids.set(id, (ids.get(id) || 0) + 1);
  }
  return ids;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory, relativeBase = '') {
  const files = [];
  if (!await exists(directory)) return files;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ignoredDirectories.has(entry.name)) continue;
    const relativePath = path.join(relativeBase, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolutePath, relativePath));
    else if (entry.isFile()) files.push(relativePath);
  }
  return files;
}

function isNoIndex(markup) {
  const robots = metaTag(markup, 'name', 'robots');
  return /(?:^|,)\s*noindex\b/i.test(attributeValue(robots || '', 'content') || '');
}

function localTarget(rootDirectory, sourceRelativePath, rawReference) {
  const reference = normaliseReference(rawReference);
  if (!reference || isExternalReference(reference)) return null;
  const sourceUrl = new URL(sourceRelativePath.replaceAll(path.sep, '/'), 'https://local.invalid/');
  const resolved = new URL(reference, sourceUrl);
  let targetRelativePath = decodeURIComponent(resolved.pathname.replace(/^\//, ''));
  if (!targetRelativePath || targetRelativePath.endsWith('/')) targetRelativePath += 'index.html';
  const absolutePath = path.resolve(rootDirectory, targetRelativePath);
  const rootPrefix = `${path.resolve(rootDirectory)}${path.sep}`;
  if (absolutePath !== path.resolve(rootDirectory) && !absolutePath.startsWith(rootPrefix)) {
    return { unsafe: true, reference, targetRelativePath };
  }
  return {
    absolutePath,
    fragment: decodeURIComponent(resolved.hash.replace(/^#/, '')),
    reference,
    targetRelativePath
  };
}

function collectMarkupReferences(markup) {
  const references = [];
  for (const tag of openingTags(markup)) {
    for (const attribute of ['href', 'src', 'poster']) {
      const value = attributeValue(tag, attribute);
      if (value !== null) references.push({ attribute, optional: /^<img\b/i.test(tag) && /onerror="this\.remove\(\)"/i.test(tag), tag, value });
    }
    const srcset = attributeValue(tag, 'srcset');
    if (srcset) {
      for (const candidate of srcset.split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        if (value) references.push({ attribute: 'srcset', optional: false, tag, value });
      }
    }
  }
  return references;
}

function collectCssReferences(markup) {
  const references = [];
  for (const match of markup.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi)) references.push(match[2]);
  return references;
}

function compareSets(expected, actual, label, failures) {
  for (const value of expected) if (!actual.has(value)) failures.push(`${label}: falta ${value}`);
  for (const value of actual) if (!expected.has(value)) failures.push(`${label}: entrada inesperada ${value}`);
}

export async function validateSite({ rootDirectory = defaultRoot, quiet = false } = {}) {
  const root = path.resolve(rootDirectory);
  const failures = [];
  const warnings = [];
  const allRootEntries = await readdir(root, { withFileTypes: true });
  const htmlFiles = allRootEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort((left, right) => left === 'index.html' ? -1 : right === 'index.html' ? 1 : left.localeCompare(right));

  if (!htmlFiles.length) failures.push('não existem páginas HTML na raiz');

  const markupByPage = new Map();
  const idsByPage = new Map();
  const canonicalByPage = new Map();
  const indexableCanonicals = new Set();

  for (const page of htmlFiles) {
    const markup = await readFile(path.join(root, page), 'utf8');
    markupByPage.set(page, markup);
    const ids = pageIds(markup);
    idsByPage.set(page, ids);

    if (!/<html\b[^>]*\blang="pt"/i.test(markup)) failures.push(`${page}: <html> deve declarar lang="pt"`);
    if (openingTags(markup, 'main').length !== 1) failures.push(`${page}: deve existir exatamente um <main>`);
    if (openingTags(markup, 'title').length !== 1) failures.push(`${page}: deve existir exatamente um <title>`);
    if (!/<title\b(?=[^>]*data-pt=)(?=[^>]*data-en=)[^>]*>/i.test(markup)) failures.push(`${page}: título bilingue incompleto`);

    const description = metaTag(markup, 'name', 'description');
    if (!description) failures.push(`${page}: meta description em falta`);
    else if (!hasAttribute(description, 'data-content-pt') || !hasAttribute(description, 'data-content-en')) failures.push(`${page}: meta description bilingue incompleta`);

    const canonical = canonicalTag(markup);
    if (!canonical) failures.push(`${page}: canonical em falta`);
    else {
      const canonicalValue = attributeValue(canonical, 'href');
      try {
        const url = new URL(canonicalValue || '');
        const expectedPath = page === 'index.html' ? '/' : `/${page}`;
        if (url.protocol !== 'https:' || url.search || url.hash || url.pathname !== expectedPath) failures.push(`${page}: canonical inválido (${canonicalValue})`);
        else {
          canonicalByPage.set(page, url.href);
          if (!isNoIndex(markup)) indexableCanonicals.add(url.href);
        }
      } catch {
        failures.push(`${page}: canonical inválido (${canonicalValue || 'vazio'})`);
      }
    }

    const canonicalUrl = canonicalByPage.get(page);
    const requiredMetadata = [
      ['property', 'og:type'], ['property', 'og:title'], ['property', 'og:description'],
      ['property', 'og:url'], ['name', 'twitter:card'], ['name', 'twitter:title'],
      ['name', 'twitter:description']
    ];
    for (const [attribute, value] of requiredMetadata) {
      if (!metaTag(markup, attribute, value)) failures.push(`${page}: metadata ${value} em falta`);
    }
    const openGraphUrl = metaTag(markup, 'property', 'og:url');
    if (canonicalUrl && attributeValue(openGraphUrl || '', 'content') !== canonicalUrl) failures.push(`${page}: og:url não corresponde ao canonical`);

    for (const [id, count] of ids) if (count > 1) failures.push(`${page}: id duplicado "${id}"`);

    const skipLink = openingTags(markup, 'a').find((tag) => /(?:^|\s)skip-link(?:\s|$)/.test(attributeValue(tag, 'class') || ''));
    if (!skipLink) failures.push(`${page}: skip link em falta`);
    else {
      const target = (attributeValue(skipLink, 'href') || '').replace(/^#/, '');
      if (!target || !ids.has(target)) failures.push(`${page}: destino do skip link não existe`);
    }

    for (const tag of openingTags(markup)) {
      const pairedAttributes = [
        ['data-pt', 'data-en'], ['data-aria-pt', 'data-aria-en'],
        ['data-alt-pt', 'data-alt-en'], ['data-content-pt', 'data-content-en']
      ];
      for (const [portuguese, english] of pairedAttributes) {
        if (hasAttribute(tag, portuguese) !== hasAttribute(tag, english)) failures.push(`${page}: tradução incompleta em ${tag.slice(0, 110)}`);
      }

      if (/^<img\b/i.test(tag) && !hasAttribute(tag, 'alt')) failures.push(`${page}: imagem sem atributo alt (${attributeValue(tag, 'src') || 'sem src'})`);
      if (/^<button\b/i.test(tag) && !hasAttribute(tag, 'type')) failures.push(`${page}: botão sem type explícito`);

      if (/^<a\b/i.test(tag) && attributeValue(tag, 'target') === '_blank') {
        const rel = (attributeValue(tag, 'rel') || '').toLowerCase().split(/\s+/);
        if (!rel.includes('noopener')) failures.push(`${page}: link target="_blank" sem rel="noopener"`);
      }

      for (const ariaAttribute of ['aria-controls', 'aria-labelledby']) {
        const controlledIds = (attributeValue(tag, ariaAttribute) || '').split(/\s+/).filter(Boolean);
        for (const controlledId of controlledIds) if (!ids.has(controlledId)) failures.push(`${page}: ${ariaAttribute} aponta para id inexistente "${controlledId}"`);
      }
    }
  }

  for (const [page, markup] of markupByPage) {
    for (const reference of collectMarkupReferences(markup)) {
      const target = localTarget(root, page, reference.value);
      if (!target) continue;
      if (target.unsafe) {
        failures.push(`${page}: referência sai da raiz (${target.reference})`);
        continue;
      }
      if (!await exists(target.absolutePath)) {
        const message = `${page}: ficheiro em falta (${target.reference})`;
        if (reference.optional) warnings.push(`${message} — fotografia opcional com fallback`);
        else failures.push(message);
        continue;
      }
      if (target.fragment && target.targetRelativePath.endsWith('.html')) {
        const targetIds = idsByPage.get(target.targetRelativePath);
        if (!targetIds?.has(target.fragment)) failures.push(`${page}: âncora em falta (${target.reference})`);
      }
    }
  }

  for (const cssFile of (await walk(path.join(root, 'css'), 'css')).filter((file) => file.endsWith('.css'))) {
    const css = await readFile(path.join(root, cssFile), 'utf8');
    for (const reference of collectCssReferences(css)) {
      const target = localTarget(root, cssFile, reference);
      if (target && !target.unsafe && !await exists(target.absolutePath)) failures.push(`${cssFile}: ficheiro em falta (${reference})`);
      if (target?.unsafe) failures.push(`${cssFile}: referência sai da raiz (${reference})`);
    }
  }

  const scripts = [
    ...(await walk(path.join(root, 'js'), 'js')).filter((file) => file.endsWith('.js')),
    ...(await walk(path.join(root, 'scripts'), 'scripts')).filter((file) => file.endsWith('.mjs'))
  ];
  for (const script of scripts) {
    try {
      await execFileAsync(process.execPath, ['--check', path.join(root, script)]);
    } catch (error) {
      failures.push(`${script}: JavaScript inválido (${error.stderr?.trim() || error.message})`);
    }
  }

  for (const asset of await walk(path.join(root, 'assets'), 'assets')) {
    if (!publishableAssetExtensions.has(path.extname(asset).toLowerCase())) continue;
    const details = await stat(path.join(root, asset));
    if (details.size === 0) failures.push(`${asset}: asset vazio`);
  }

  const sourceTextFiles = (await walk(root)).filter((file) => textExtensions.has(path.extname(file).toLowerCase()));
  const forbiddenKidsRange = /10\s*(?:[–—-]|a|to|aos)\s*13\b/iu;
  for (const file of sourceTextFiles) {
    const contents = await readFile(path.join(root, file), 'utf8');
    if (forbiddenKidsRange.test(contents)) failures.push(`${file}: intervalo Kids 3 desatualizado (deve ser 10–14)`);
  }

  const visitMarkup = markupByPage.get('visitar.html');
  if (!visitMarkup) failures.push('visitar.html: página separada em falta');
  else {
    if (/\bdata-booking\b/i.test(visitMarkup)) failures.push('visitar.html: não deve encaminhar visitantes para a marcação experimental');
    if (!/data-whatsapp/i.test(visitMarkup)) failures.push('visitar.html: contacto de visitante em falta');
    for (const expected of ['one day', '7 days', '15 days', '30 days', 'BJJ', 'Workout', 'rental', '15 minutes', 'no booking']) {
      if (!visitMarkup.toLowerCase().includes(expected.toLowerCase())) failures.push(`visitar.html: facto bilingue confirmado em falta (${expected})`);
    }
    if (!/href=["']horarios\.html#weekly-schedule["']/i.test(visitMarkup)) failures.push('visitar.html: ligação direta ao horário em falta');
    if (/href=["'][^"']*\/(?:marcar|gerir)(?:[?#"'])/i.test(visitMarkup)) failures.push('visitar.html: não deve conter ligações ao sistema de marcações');

    const expectedPriceRows = [
      ['BJJ · 1 DIA', 'BJJ · 1 DAY', '15 €'],
      ['Aluguer de kimono e rashguard + lavagem', 'Rent gi and rashguard + laundry', '80 €', '150 €', '200 €'],
      ['Atleta compra kimono e rashguard + lavagem', 'Athlete buys gi and rashguard + laundry', '70 €', '130 €', '170 €'],
      ['Atleta compra kimono e rashguard · sem lavagem', 'Athlete buys gi and rashguard · no laundry', '60 €', '110 €', '150 €'],
      ['Aluguer de kimono e rashguard + lavagem', 'Rent gi and rashguard + laundry', '90 €', '170 €', '220 €'],
      ['Atleta compra kimono e rashguard + lavagem', 'Athlete buys gi and rashguard + laundry', '80 €', '170 €', '200 €'],
      ['Atleta compra kimono e rashguard · sem lavagem', 'Athlete buys gi and rashguard · no laundry', '70 €', '150 €', '180 €']
    ];
    let priceSearchFrom = 0;
    for (const priceRow of expectedPriceRows) {
      const rowPosition = visitMarkup.indexOf(priceRow[0], priceSearchFrom);
      if (rowPosition === -1) {
        failures.push(`visitar.html: linha de preços em falta (${priceRow[0]})`);
        continue;
      }
      const rowTag = priceRow[0] === 'BJJ · 1 DIA' ? '<article' : '<tr';
      const rowStart = visitMarkup.lastIndexOf(rowTag, rowPosition);
      const rowEnd = visitMarkup.indexOf(priceRow[0] === 'BJJ · 1 DIA' ? '</article>' : '</tr>', rowPosition);
      const rowMarkup = visitMarkup.slice(rowStart === -1 ? rowPosition : rowStart, rowEnd === -1 ? rowPosition + 1200 : rowEnd);
      for (const expected of priceRow.slice(1)) {
        if (!rowMarkup.includes(expected)) failures.push(`visitar.html: valor bilingue/preço em falta na linha ${priceRow[0]} (${expected})`);
      }
      priceSearchFrom = Math.max(priceSearchFrom, rowEnd);
    }
    for (const expected of ['cartão', 'card', 'dinheiro', 'cash', 'não está incluído', 'not included']) {
      if (!visitMarkup.toLowerCase().includes(expected.toLowerCase())) failures.push(`visitar.html: informação operacional em falta (${expected})`);
    }
  }

  const sitemapPath = path.join(root, 'sitemap.xml');
  if (!await exists(sitemapPath)) failures.push('sitemap.xml em falta');
  else {
    const sitemap = await readFile(sitemapPath, 'utf8');
    const sitemapUrls = new Set(Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]));
    compareSets(indexableCanonicals, sitemapUrls, 'sitemap.xml', failures);
  }

  const canonicalOrigins = new Set(Array.from(canonicalByPage.values(), (value) => new URL(value).origin));
  if (canonicalOrigins.size !== 1) failures.push('os canonicals devem usar uma única origem HTTPS');
  const canonicalOrigin = canonicalOrigins.values().next().value;
  const robotsPath = path.join(root, 'robots.txt');
  if (!await exists(robotsPath)) failures.push('robots.txt em falta');
  else {
    const robots = await readFile(robotsPath, 'utf8');
    if (/^\s*Disallow:\s*\/\s*$/im.test(robots)) failures.push('robots.txt bloqueia todo o site');
    if (canonicalOrigin && !robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) failures.push('robots.txt não aponta para o sitemap canonical');
  }

  if (!quiet) {
    for (const warning of warnings) console.warn(`AVISO: ${warning}`);
    for (const failure of failures) console.error(`ERRO: ${failure}`);
  }
  if (failures.length) {
    const error = new Error(`Validação falhou com ${failures.length} erro(s).`);
    error.failures = failures;
    error.warnings = warnings;
    throw error;
  }
  if (!quiet) console.log(`Site validado: ${htmlFiles.length} páginas, ${scripts.length} scripts e ${warnings.length} aviso(s) de conteúdo.`);
  return { htmlFiles, scripts, warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  validateSite().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
