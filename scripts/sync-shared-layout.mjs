import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptsDirectory, '..');
const partialsDirectory = path.join(rootDirectory, 'partials');
const assetVersion = '20260816-1';

const [header, footer, floatingWhatsApp, entries] = await Promise.all([
  readFile(path.join(partialsDirectory, 'header.html'), 'utf8'),
  readFile(path.join(partialsDirectory, 'footer.html'), 'utf8'),
  readFile(path.join(partialsDirectory, 'floating-whatsapp.html'), 'utf8'),
  readdir(rootDirectory, { withFileTypes: true })
]);

const pages = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

const pageMetadata = {
  'index.html': {
    titlePt: 'Focus Jiu-Jitsu Headquarters | Matosinhos',
    titleEn: 'Focus Jiu-Jitsu Headquarters | Matosinhos',
    descriptionPt: 'Focus Jiu-Jitsu Headquarters em Matosinhos. Jiu-Jitsu para adultos, crianças, iniciantes e atletas de competição.',
    descriptionEn: 'Focus Jiu-Jitsu Headquarters in Matosinhos. Jiu-Jitsu for adults, children, beginners and competition athletes.'
  },
  'academia.html': {
    titlePt: 'A Academia | Focus Jiu-Jitsu Headquarters',
    titleEn: 'The Academy | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Conheça a filosofia, equipa, instalações e experiência da Focus Jiu-Jitsu Headquarters em Matosinhos.',
    descriptionEn: 'Discover the philosophy, team, facilities and experience of Focus Jiu-Jitsu Headquarters in Matosinhos.'
  },
  'adultos.html': {
    titlePt: 'Adultos | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Adults | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Programa de Jiu-Jitsu para Adultos da Focus Jiu-Jitsu Headquarters, com sete tipos de aulas para todos os níveis.',
    descriptionEn: 'The Focus Jiu-Jitsu Headquarters Adults Program, with seven class types for every level.'
  },
  'equipa.html': {
    titlePt: 'Equipa | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Team | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Conheça os professores e atletas que lideram os programas da Focus Jiu-Jitsu Headquarters.',
    descriptionEn: 'Meet the instructors and athletes who lead the programs at Focus Jiu-Jitsu Headquarters.'
  },
  'filiais.html': {
    titlePt: 'Filiais | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Locations | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Filiais Focus Jiu-Jitsu em Portugal, Espanha e nos Países Baixos.',
    descriptionEn: 'Focus Jiu-Jitsu locations in Portugal, Spain and the Netherlands.'
  },
  'filiais-portugal.html': {
    titlePt: 'Portugal | Filiais Focus Jiu-Jitsu',
    titleEn: 'Portugal | Focus Jiu-Jitsu Locations',
    descriptionPt: 'Academias e filiais Focus Jiu-Jitsu em Portugal.',
    descriptionEn: 'Focus Jiu-Jitsu academies and locations in Portugal.'
  },
  'filiais-espanha.html': {
    titlePt: 'Espanha | Filiais Focus Jiu-Jitsu',
    titleEn: 'Spain | Focus Jiu-Jitsu Locations',
    descriptionPt: 'Filiais Focus Jiu-Jitsu em Espanha: Alicante, Mutxamel, Villajoyosa, San Vicente del Raspeig, Elche, Santiago de Compostela e A Coruña.',
    descriptionEn: 'Focus Jiu-Jitsu locations in Spain: Alicante, Mutxamel, Villajoyosa, San Vicente del Raspeig, Elche, Santiago de Compostela and A Coruña.'
  },
  'filiais-netherlands.html': {
    titlePt: 'Países Baixos | Filiais Focus Jiu-Jitsu',
    titleEn: 'Netherlands | Focus Jiu-Jitsu Locations',
    descriptionPt: 'Filiais Focus Jiu-Jitsu nos Países Baixos: Groningen, Amesterdão e Eindhoven.',
    descriptionEn: 'Focus Jiu-Jitsu locations in the Netherlands: Groningen, Amsterdam and Eindhoven.'
  },
  'historia-conquistas.html': {
    titlePt: 'História e Conquistas | Focus Jiu-Jitsu Headquarters',
    titleEn: 'History and Achievements | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'A história da Focus Jiu-Jitsu: das origens no Norte de Portugal à expansão internacional e aos principais resultados competitivos da equipa.',
    descriptionEn: 'The history of Focus Jiu-Jitsu, from its origins in Northern Portugal to international expansion and the team’s main competitive results.'
  },
  'horarios.html': {
    titlePt: 'Horários | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Schedule | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Horários das aulas da Focus Jiu-Jitsu Headquarters em Matosinhos.',
    descriptionEn: 'Class schedule for Focus Jiu-Jitsu Headquarters in Matosinhos.'
  },
  'instalacoes.html': {
    titlePt: 'Instalações | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Facilities | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Conheça os 2.500 m² da Focus Jiu-Jitsu Headquarters: 1.500 m² de musculação e 1.000 m² de tatami.',
    descriptionEn: 'Discover the 2,500 m² Focus Jiu-Jitsu Headquarters, with 1,500 m² of strength training space and 1,000 m² of mats.'
  },
  'kids.html': {
    titlePt: 'Kids | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Kids | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Programa de Jiu-Jitsu Kids da Focus Jiu-Jitsu Headquarters em Matosinhos.',
    descriptionEn: 'The Kids Jiu-Jitsu Program at Focus Jiu-Jitsu Headquarters in Matosinhos.'
  },
  'produtos.html': {
    titlePt: 'Produtos | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Products | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Coleção oficial de kimonos Focus Jiu-Jitsu, disponíveis em branco e preto.',
    descriptionEn: 'The official Focus Jiu-Jitsu gi collection, available in white and black.'
  },
  'programas.html': {
    titlePt: 'Programas | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Programs | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Conheça os programas de Jiu-Jitsu para Adultos e Kids da Focus Jiu-Jitsu Headquarters.',
    descriptionEn: 'Discover the Adults and Kids Jiu-Jitsu programs at Focus Jiu-Jitsu Headquarters.'
  },
  'visitar.html': {
    titlePt: 'Visitar | Focus Jiu-Jitsu Headquarters',
    titleEn: 'Visit | Focus Jiu-Jitsu Headquarters',
    descriptionPt: 'Visite a Focus Jiu-Jitsu Headquarters em Matosinhos Sul e conheça os planos turísticos de treino.',
    descriptionEn: 'Visit Focus Jiu-Jitsu Headquarters in Matosinhos Sul and discover the training options for visitors.'
  }
};

const imageDimensions = {
  'assets/images/focus-logo.png': [1536, 1024],
  'assets/images/adultos-program.jpg': [1200, 1800],
  'assets/images/program-kids.jpg': [1200, 1800],
  'assets/images/program-kids-training.jpg': [1600, 1200],
  'assets/images/program-adults-class.jpg': [1600, 1200],
  'assets/images/facilities/academy-hero-poster.jpg': [1600, 900],
  'assets/images/facilities/gym-main-floor-color.jpg': [2200, 1470],
  'assets/images/facilities/gym-panorama-color.jpg': [2400, 1405],
  'assets/images/facilities/gym-free-weights-color.jpg': [1800, 1200],
  'assets/images/facilities/gym-conditioning-color.jpg': [2200, 1332],
  'assets/images/facilities/pro-shop.jpg': [1600, 1200],
  'assets/images/facilities/tatami-gallery-updated.jpg': [1320, 864],
  'assets/images/facilities/tatami-main.jpg': [1920, 1200],
  'assets/images/team/team-placeholder.svg': [1200, 1500]
};

const imageAltTranslations = {
  'Treino de Jiu-Jitsu para adultos': 'Jiu-Jitsu training for adults',
  'Aula de Jiu-Jitsu para crianças': 'Jiu-Jitsu class for children',
  'Manoel Neto com kimono Ultralight preto': 'Manoel Neto wearing the black Ultralight gi',
  'Vista geral da área de musculação da Focus Jiu-Jitsu Headquarters': 'Overview of the strength training area at Focus Jiu-Jitsu Headquarters',
  'Área de tatami da Focus Jiu-Jitsu Headquarters': 'Mat area at Focus Jiu-Jitsu Headquarters',
  'Tatami da Focus Jiu-Jitsu Headquarters': 'Mats at Focus Jiu-Jitsu Headquarters',
  'Zona de peso livre da Focus Jiu-Jitsu Headquarters': 'Free-weight area at Focus Jiu-Jitsu Headquarters',
  'Receção e Pro Shop da Focus Jiu-Jitsu Headquarters': 'Reception and Pro Shop at Focus Jiu-Jitsu Headquarters',
  'Zona de força e preparação física da Focus Jiu-Jitsu Headquarters': 'Strength and conditioning area at Focus Jiu-Jitsu Headquarters'
};

const optimizedMediaPaths = [
  'assets/images/adultos-program.jpg',
  'assets/images/program-kids.jpg',
  'assets/images/program-kids-training.jpg',
  'assets/images/program-adults-class.jpg',
  'assets/images/facilities/academy-hero-poster.jpg',
  'assets/images/facilities/pro-shop.jpg',
  'assets/images/facilities/tatami-gallery-updated.jpg',
  'assets/images/facilities/tatami-main.jpg',
  'assets/images/team/henrique-soares.jpg',
  'assets/images/team/luana-oliveira.jpg',
  'assets/images/team/manoel-neto.jpg',
  'assets/images/team/pedro-paquito-ramalho.jpg',
  'assets/images/team/pedro-zogbi-2026.jpg',
  'assets/images/team/francisco-rocha.jpg',
  'assets/images/team/ricardo-almeida.jpg',
  'assets/images/team/thallyson-vasconcelos.jpg',
  'assets/videos/home.mp4',
  'assets/videos/academy-hero.mp4'
];

const versionedAssetPaths = [
  'css/style.css',
  'css/v54.css',
  'js/main.js',
  'js/product-gallery.js',
  ...optimizedMediaPaths
];
const versionedAssetPattern = new RegExp(
  `(${versionedAssetPaths
    .map((assetPath) => assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})(?:\\?v=[^"'| )]+)?`,
  'g'
);

function addImageDimensions(markup) {
  return markup.replace(/<img\b[^>]*>/g, (tag) => {
    if (/\bwidth=/.test(tag) && /\bheight=/.test(tag)) return tag;

    const source = tag.match(/\bsrc="([^"?]+)(?:\?[^"]*)?"/i)?.[1];
    if (!source) return tag;

    const dimensions = source.startsWith('assets/images/products/')
      ? [1200, 1800]
      : source.startsWith('assets/images/team/') && source.endsWith('.jpg')
        ? [1200, 1800]
        : imageDimensions[source];

    if (!dimensions) return tag;
    const [width, height] = dimensions;
    return tag.replace(/\s*\/?\s*>$/, ` height="${height}" width="${width}"/>`);
  });
}

function addImageAltTranslations(markup) {
  return markup.replace(/<img\b[^>]*>/g, (tag) => {
    if (/\bdata-alt-en=/.test(tag)) return tag;
    const altText = tag.match(/\balt="([^"]*)"/)?.[1];
    const englishAltText = imageAltTranslations[altText];
    if (!englishAltText) return tag;

    return tag.replace(
      `alt="${altText}"`,
      `alt="${altText}" data-alt-en="${englishAltText}" data-alt-pt="${altText}"`
    );
  });
}

function normalizeAssetVersions(markup) {
  return markup.replace(
    versionedAssetPattern,
    (_match, assetPath) => `${assetPath}?v=${assetVersion}`
  );
}

for (const page of pages) {
  const pagePath = path.join(rootDirectory, page);
  const original = await readFile(pagePath, 'utf8');
  const withHeader = original.replace(
    /<header class="site-header" id="top">[\s\S]*?<\/header>/,
    header.trim()
  )
    .replaceAll('href="programas.html">Programas</a>', 'href="index.html#programs">Programas</a>')
    .replaceAll(
      '<a data-en="The Academy" data-pt="A Academia" href="academia.html">A Academia</a>',
      '<a data-en="The Academy" data-pt="A Academia" href="index.html">A Academia</a>'
    )
    .replaceAll(
      '<nav aria-label="Breadcrumb" class="page-breadcrumb">',
      '<nav aria-label="Navegação estrutural" class="page-breadcrumb" data-aria-en="Breadcrumb" data-aria-pt="Navegação estrutural">'
    )
    .replace(
      /aria-label="MAT 1 — horário mobile" class="schedule-mobile-list"(?! data-aria)/g,
      'aria-label="MAT 1 — horário mobile" class="schedule-mobile-list" data-aria-en="Mat 1 mobile schedule" data-aria-pt="MAT 1 — horário mobile"'
    )
    .replace(
      /aria-label="MAT 2 — horário mobile" class="schedule-mobile-list"(?! data-aria)/g,
      'aria-label="MAT 2 — horário mobile" class="schedule-mobile-list" data-aria-en="Mat 2 mobile schedule" data-aria-pt="MAT 2 — horário mobile"'
    )
    .replace(
      /aria-label="MAT 3 — horário mobile" class="schedule-mobile-list"(?! data-aria)/g,
      'aria-label="MAT 3 — horário mobile" class="schedule-mobile-list" data-aria-en="Mat 3 mobile schedule" data-aria-pt="MAT 3 — horário mobile"'
    );
  const updated = withHeader.replace(
    /<footer class="site-footer" id="footer-contact">[\s\S]*?<\/footer>/,
    footer.trim()
  ).replace(
    /<a(?=[^>]*class="floating-whatsapp whatsapp-link")[^>]*>[\s\S]*?<\/a\s*>/,
    floatingWhatsApp.trim()
  );

  const metadata = pageMetadata[page];
  const withMetadata = metadata
    ? updated
      .replace(
        /<meta\b(?=[^>]*\bname="description")[^>]*\/?>/,
        `<meta content="${metadata.descriptionPt}" data-content-en="${metadata.descriptionEn}" data-content-pt="${metadata.descriptionPt}" name="description"/>`
      )
      .replace(
        /<title\b[^>]*>[\s\S]*?<\/title>/,
        `<title data-en="${metadata.titleEn}" data-pt="${metadata.titlePt}">${metadata.titlePt}</title>`
      )
    : updated;
  const withDimensions = addImageDimensions(withMetadata);
  const withAccessibleImages = addImageAltTranslations(withDimensions);
  const withNormalizedVersions = normalizeAssetVersions(withAccessibleImages);

  if (withNormalizedVersions === original) continue;
  await writeFile(pagePath, withNormalizedVersions);
}

console.log(`Synchronized shared header and footer across ${pages.length} pages.`);
