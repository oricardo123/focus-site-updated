import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSite } from './validate-site.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const rootDirectory = path.resolve(path.dirname(scriptPath), '..');
const defaultOutput = path.join(rootDirectory, 'dist', 'publish');
const assetExtensions = new Set([
  '.avif', '.gif', '.ico', '.jpeg', '.jpg', '.mp4', '.otf', '.png', '.svg',
  '.ttf', '.webm', '.webp', '.woff', '.woff2'
]);

function outputFromArguments() {
  const outputIndex = process.argv.indexOf('--output');
  if (outputIndex === -1) return defaultOutput;
  const value = process.argv[outputIndex + 1];
  if (!value || value.startsWith('--')) throw new Error('Usa --output seguido de uma pasta explícita.');
  return path.resolve(process.cwd(), value);
}

function assertSafeOutput(outputDirectory) {
  const root = path.resolve(rootDirectory);
  const output = path.resolve(outputDirectory);
  const relative = path.relative(root, output);
  const parts = relative.split(path.sep).filter(Boolean);
  if (output === path.parse(output).root || output === root || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('A pasta de saída tem de ficar dentro de dist/ neste projeto.');
  }
  if (parts[0] !== 'dist' || parts.length < 2) throw new Error('A saída deve ser uma subpasta explícita de dist/, por exemplo dist/publish.');
}

async function copySelectedTree(sourceDirectory, targetDirectory, shouldCopy) {
  await mkdir(targetDirectory, { recursive: true });
  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const source = path.join(sourceDirectory, entry.name);
    const target = path.join(targetDirectory, entry.name);
    if (entry.isDirectory()) await copySelectedTree(source, target, shouldCopy);
    else if (entry.isFile() && shouldCopy(source, entry.name)) await cp(source, target);
  }
}

async function packageFiles(directory, relativeBase = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(relativeBase, entry.name);
    if (entry.isDirectory()) files.push(...await packageFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

await validateSite({ rootDirectory });

const outputDirectory = outputFromArguments();
assertSafeOutput(outputDirectory);
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const rootEntries = await readdir(rootDirectory, { withFileTypes: true });
for (const entry of rootEntries) {
  if (!entry.isFile()) continue;
  if (entry.name.endsWith('.html') || entry.name === 'robots.txt' || entry.name === 'sitemap.xml') {
    await cp(path.join(rootDirectory, entry.name), path.join(outputDirectory, entry.name));
  }
}

await copySelectedTree(path.join(rootDirectory, 'css'), path.join(outputDirectory, 'css'), (_source, name) => name.endsWith('.css') && name !== 'typography-lab.css');
await copySelectedTree(path.join(rootDirectory, 'js'), path.join(outputDirectory, 'js'), (_source, name) => name.endsWith('.js') && name !== 'typography-lab.js');
await copySelectedTree(path.join(rootDirectory, 'assets'), path.join(outputDirectory, 'assets'), (source) => assetExtensions.has(path.extname(source).toLowerCase()));

const files = await packageFiles(outputDirectory);
const disallowed = files.filter((file) => {
  const topLevel = file.split(path.sep)[0];
  return !file.endsWith('.html')
    && file !== 'robots.txt'
    && file !== 'sitemap.xml'
    && !['css', 'js', 'assets'].includes(topLevel);
});
if (disallowed.length) throw new Error(`O pacote contém ficheiros não permitidos: ${disallowed.join(', ')}`);
if (files.some((file) => file.split(path.sep).some((part) => ['.git', 'scripts', 'partials', 'dist'].includes(part)))) {
  throw new Error('O pacote contém ferramentas ou ficheiros de origem que não podem ser publicados.');
}

await validateSite({ rootDirectory: outputDirectory });
let totalBytes = 0;
for (const file of files) totalBytes += (await stat(path.join(outputDirectory, file))).size;
console.log(`Pacote pronto: ${files.length} ficheiros, ${(totalBytes / 1024 / 1024).toFixed(1)} MB, em ${outputDirectory}`);
