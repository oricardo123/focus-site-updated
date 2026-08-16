(() => {
  'use strict';

  const queryAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const fonts = [
    { value: 'current', label: 'Atual · Oswald + Inter', display: '"Oswald", "Arial Narrow", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif' },
    { value: 'oswald-manrope', label: '01 · Oswald + Manrope', display: '"Oswald", "Arial Narrow", Arial, sans-serif', body: '"Manrope", Arial, Helvetica, sans-serif' },
    { value: 'oswald-space', label: '02 · Oswald + Space Grotesk', display: '"Oswald", "Arial Narrow", Arial, sans-serif', body: '"Space Grotesk", Arial, Helvetica, sans-serif' },
    { value: 'barlow-manrope', label: '03 · Barlow Condensed + Manrope', display: '"Barlow Condensed", "Arial Narrow", Arial, sans-serif', body: '"Manrope", Arial, Helvetica, sans-serif' },
    { value: 'barlow-archivo', label: '04 · Barlow Condensed + Archivo', display: '"Barlow Condensed", "Arial Narrow", Arial, sans-serif', body: '"Archivo", Arial, Helvetica, sans-serif' },
    { value: 'bebas-inter', label: '05 · Bebas Neue + Inter', display: '"Bebas Neue", "Arial Narrow", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif' },
    { value: 'bebas-manrope', label: '06 · Bebas Neue + Manrope', display: '"Bebas Neue", "Arial Narrow", Arial, sans-serif', body: '"Manrope", Arial, Helvetica, sans-serif' },
    { value: 'anton-space', label: '07 · Anton + Space Grotesk', display: '"Anton", Impact, sans-serif', body: '"Space Grotesk", Arial, Helvetica, sans-serif' },
    { value: 'anton-sora', label: '08 · Anton + Sora', display: '"Anton", Impact, sans-serif', body: '"Sora", Arial, Helvetica, sans-serif' },
    { value: 'roboto-family', label: '09 · Roboto Condensed + Roboto', display: '"Roboto Condensed", "Arial Narrow", Arial, sans-serif', body: '"Roboto", Arial, Helvetica, sans-serif' },
    { value: 'roboto-plex', label: '10 · Roboto Condensed + IBM Plex Sans', display: '"Roboto Condensed", "Arial Narrow", Arial, sans-serif', body: '"IBM Plex Sans", Arial, Helvetica, sans-serif' },
    { value: 'league-source', label: '11 · League Gothic + Source Sans 3', display: '"League Gothic", "Arial Narrow", Arial, sans-serif', body: '"Source Sans 3", Arial, Helvetica, sans-serif' },
    { value: 'teko-montserrat', label: '12 · Teko + Montserrat', display: '"Teko", "Arial Narrow", Arial, sans-serif', body: '"Montserrat", Arial, Helvetica, sans-serif' },
    { value: 'archivo-family', label: '13 · Archivo Narrow + Archivo', display: '"Archivo Narrow", "Arial Narrow", Arial, sans-serif', body: '"Archivo", Arial, Helvetica, sans-serif' },
    { value: 'fjalla-lato', label: '14 · Fjalla One + Lato', display: '"Fjalla One", "Arial Narrow", Arial, sans-serif', body: '"Lato", Arial, Helvetica, sans-serif' },
    { value: 'barlow-semi', label: '15 · Barlow Semi Condensed + Barlow', display: '"Barlow Semi Condensed", "Arial Narrow", Arial, sans-serif', body: '"Barlow", Arial, Helvetica, sans-serif' },
    { value: 'saira-inter', label: '16 · Saira Condensed + Inter', display: '"Saira Condensed", "Arial Narrow", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif' },
    { value: 'big-shoulders-manrope', label: '17 · Big Shoulders Display + Manrope', display: '"Big Shoulders Display", "Arial Narrow", Arial, sans-serif', body: '"Manrope", Arial, Helvetica, sans-serif' },
    { value: 'alumni-manrope', label: '18 · Alumni Sans + Manrope', display: '"Alumni Sans", "Arial Narrow", Arial, sans-serif', body: '"Manrope", Arial, Helvetica, sans-serif' },
    { value: 'titillium-source', label: '19 · Titillium Web + Source Sans 3', display: '"Titillium Web", "Arial Narrow", Arial, sans-serif', body: '"Source Sans 3", Arial, Helvetica, sans-serif' },
    { value: 'rajdhani-inter', label: '20 · Rajdhani + Inter', display: '"Rajdhani", "Arial Narrow", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif' },
    { value: 'encode-open', label: '21 · Encode Sans Condensed + Open Sans', display: '"Encode Sans Condensed", "Arial Narrow", Arial, sans-serif', body: '"Open Sans", Arial, Helvetica, sans-serif' },
    { value: 'pt-family', label: '22 · PT Sans Narrow + PT Sans', display: '"PT Sans Narrow", "Arial Narrow", Arial, sans-serif', body: '"PT Sans", Arial, Helvetica, sans-serif' },
    { value: 'yanone-lato', label: '23 · Yanone Kaffeesatz + Lato', display: '"Yanone Kaffeesatz", "Arial Narrow", Arial, sans-serif', body: '"Lato", Arial, Helvetica, sans-serif' },
    { value: 'ubuntu-family', label: '24 · Ubuntu Condensed + Ubuntu', display: '"Ubuntu Condensed", "Arial Narrow", Arial, sans-serif', body: '"Ubuntu", Arial, Helvetica, sans-serif' },
    { value: 'fira-family', label: '25 · Fira Sans Condensed + Fira Sans', display: '"Fira Sans Condensed", "Arial Narrow", Arial, sans-serif', body: '"Fira Sans", Arial, Helvetica, sans-serif' },
    { value: 'asap-family', label: '26 · Asap Condensed + Asap', display: '"Asap Condensed", "Arial Narrow", Arial, sans-serif', body: '"Asap", Arial, Helvetica, sans-serif' },
    { value: 'plex-family', label: '27 · IBM Plex Sans Condensed + Sans', display: '"IBM Plex Sans Condensed", "Arial Narrow", Arial, sans-serif', body: '"IBM Plex Sans", Arial, Helvetica, sans-serif' },
    { value: 'dm-inter', label: '28 · DM Sans + Inter', display: '"DM Sans", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif' },
    { value: 'syne-inter', label: '29 · Syne + Inter', display: '"Syne", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif' },
    { value: 'michroma-logo', label: '30 · Michroma + Inter · estilo logótipo', display: '"Michroma", "Arial Wide", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif', tracking: '0.04em' },
    { value: 'syncopate-logo', label: '31 · Syncopate + Inter · estilo logótipo', display: '"Syncopate", "Arial Wide", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif', tracking: '0.05em' },
    { value: 'orbitron-logo', label: '32 · Orbitron + Inter · estilo logótipo', display: '"Orbitron", "Arial Wide", Arial, sans-serif', body: '"Inter", Arial, Helvetica, sans-serif', tracking: '0.025em' },
    { value: 'general-sans-local', label: '33 · General Sans Bold · recomendação local', display: '"General Sans", Arial, sans-serif', body: '"General Sans", Arial, sans-serif' }
  ];
  const fontMap = new Map(fonts.map((font) => [font.value, font]));
  const scopes = [
    { value: 'all', label: 'Site completo', selector: 'main h1, main h2, main h3, main h4, main p, main li, main a, main button, .site-header a, .site-header button, .site-footer p, .site-footer a, .site-footer span, .site-footer li, .floating-whatsapp' },
    { value: 'titles', label: 'Títulos', selector: 'main h1, main h2, main h3, main h4' },
    { value: 'copy', label: 'Texto principal', selector: 'main p:not(.eyebrow):not([class*="kicker"]):not([class*="label"]):not([class*="meta"]), main li' },
    { value: 'navigation', label: 'Navegação', selector: '.site-header a, .site-header button, .breadcrumb a, .breadcrumb span' },
    { value: 'controls', label: 'Botões e etiquetas', selector: 'main a, main button, .floating-whatsapp' },
    { value: 'footer', label: 'Rodapé', selector: '.site-footer p, .site-footer a, .site-footer span, .site-footer li' },
    { value: 'academy-title', label: 'A Academia · título', selector: '.philosophy-editorial-heading h2' },
    { value: 'academy', label: 'A Academia · texto', selector: '.philosophy-editorial-copy p' }
  ];
  const scopeOrder = scopes.map((scope) => scope.value);
  const scopeElements = new Map(scopes.map((scope) => [scope.value, queryAll(scope.selector)]));
  const allElements = [...new Set(scopes.flatMap((scope) => scopeElements.get(scope.value)))];
  const originalStyles = new WeakMap(allElements.map((element) => [element, {
    fontFamily: element.style.fontFamily,
    fontSize: element.style.fontSize,
    letterSpacing: element.style.letterSpacing
  }]));
  const configurations = Object.fromEntries(scopes.map((scope) => [scope.value, { font: null, scale: null }]));

  try {
    const storedConfigurations = JSON.parse(localStorage.getItem('focus-typography-lab-v4') || '{}');
    scopes.forEach(({ value }) => {
      const stored = storedConfigurations[value];
      if (!stored || typeof stored !== 'object') return;
      if (stored.font === null || fontMap.has(stored.font)) configurations[value].font = stored.font;
      if (Number.isFinite(stored.scale)) configurations[value].scale = Math.min(1.2, Math.max(0.8, stored.scale));
    });
  } catch {
    // Start with the website's existing settings.
  }

  const saveConfigurations = () => {
    try {
      localStorage.setItem('focus-typography-lab-v4', JSON.stringify(configurations));
    } catch {
      // The laboratory remains usable when storage is unavailable.
    }
  };

  const applyConfigurations = () => {
    allElements.forEach((element) => {
      const original = originalStyles.get(element);
      element.style.fontFamily = original.fontFamily;
      element.style.fontSize = original.fontSize;
      element.style.letterSpacing = original.letterSpacing;
    });

    scopeOrder.forEach((scopeValue) => {
      const configuration = configurations[scopeValue];
      const font = fontMap.get(configuration.font);
      if (!font) return;
      scopeElements.get(scopeValue).forEach((element) => {
        const usesDisplayFont = element.matches('h1, h2, h3, h4');
        element.style.fontFamily = usesDisplayFont ? font.display : font.body;
        element.style.letterSpacing = usesDisplayFont && font.tracking
          ? font.tracking
          : originalStyles.get(element).letterSpacing;
      });
    });

    const scales = new Map();
    scopeOrder.forEach((scopeValue) => {
      const scale = configurations[scopeValue].scale;
      if (!Number.isFinite(scale)) return;
      scopeElements.get(scopeValue).forEach((element) => scales.set(element, scale));
    });
    scales.forEach((scale, element) => {
      const baseSize = Number.parseFloat(getComputedStyle(element).fontSize);
      element.style.fontSize = `${(baseSize * scale).toFixed(2)}px`;
    });
  };

  const localFontStylesheet = document.createElement('style');
  localFontStylesheet.textContent = '@font-face { font-family: "General Sans"; src: url("assets/fonts/local/GeneralSans-Variable.woff2") format("woff2"); font-style: normal; font-weight: 200 700; font-display: swap; }';
  document.head.append(localFontStylesheet);

  const fontStylesheets = [
    'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=Archivo+Narrow:wght@500;600;700&family=Barlow+Condensed:wght@500;600;700&family=Bebas+Neue&family=Fjalla+One&family=IBM+Plex+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=League+Gothic&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Roboto+Condensed:wght@500;600;700&family=Sora:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Teko:wght@500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Alumni+Sans:wght@500;600;700&family=Asap:wght@400;500;600;700&family=Asap+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@500;600;700&family=Big+Shoulders+Display:wght@500;600;700&family=DM+Sans:wght@500;600;700&family=Encode+Sans+Condensed:wght@500;600;700&family=Fira+Sans:wght@400;500;600;700&family=Fira+Sans+Condensed:wght@500;600;700&family=IBM+Plex+Sans+Condensed:wght@500;600;700&family=Open+Sans:wght@400;500;600;700&family=PT+Sans:wght@400;700&family=PT+Sans+Narrow:wght@400;700&family=Rajdhani:wght@500;600;700&family=Saira+Condensed:wght@500;600;700&family=Syne:wght@500;600;700&family=Titillium+Web:wght@500;600;700&family=Ubuntu:wght@400;500;700&family=Ubuntu+Condensed&family=Yanone+Kaffeesatz:wght@500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Michroma&family=Orbitron:wght@500;600;700&family=Syncopate:wght@400;700&display=swap'
  ];
  fontStylesheets.forEach((href) => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = href;
    document.head.append(stylesheet);
  });

  const control = document.createElement('details');
  control.className = 'typography-lab';
  control.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'TIPOGRAFIA E TAMANHO · TESTE LOCAL';

  const scopeField = document.createElement('label');
  scopeField.textContent = 'Área a alterar';
  const scopeSelect = document.createElement('select');
  scopeSelect.setAttribute('aria-label', 'Escolher área de texto');
  scopes.forEach(({ value, label }) => scopeSelect.add(new Option(label, value)));
  scopeField.append(scopeSelect);

  const fontField = document.createElement('label');
  fontField.textContent = 'Tipografia';
  const fontSelect = document.createElement('select');
  fontSelect.setAttribute('aria-label', 'Escolher combinação tipográfica');
  fontSelect.add(new Option('Herdar definição existente', 'inherit'));
  fonts.forEach(({ value, label }) => fontSelect.add(new Option(label, value)));
  fontField.append(fontSelect);

  const sizeField = document.createElement('div');
  sizeField.className = 'typography-lab-size';
  const sizeLabel = document.createElement('span');
  sizeLabel.textContent = 'Tamanho';
  const sizeButtons = document.createElement('div');
  const decrease = document.createElement('button');
  decrease.type = 'button';
  decrease.textContent = 'A−';
  decrease.setAttribute('aria-label', 'Reduzir texto da área selecionada');
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.setAttribute('aria-label', 'Repor tamanho da área selecionada');
  const increase = document.createElement('button');
  increase.type = 'button';
  increase.textContent = 'A+';
  increase.setAttribute('aria-label', 'Aumentar texto da área selecionada');
  sizeButtons.append(decrease, reset, increase);
  sizeField.append(sizeLabel, sizeButtons);

  const note = document.createElement('small');
  note.textContent = 'Cada área guarda definições independentes · apenas local';

  const refreshControls = () => {
    const configuration = configurations[scopeSelect.value];
    fontSelect.value = configuration.font || 'inherit';
    reset.textContent = `${Math.round((configuration.scale ?? 1) * 100)}%`;
    decrease.disabled = (configuration.scale ?? 1) <= 0.8;
    increase.disabled = (configuration.scale ?? 1) >= 1.2;
  };
  const updateScale = (change) => {
    const configuration = configurations[scopeSelect.value];
    const currentScale = configuration.scale ?? 1;
    configuration.scale = change === 0 ? 1 : Math.min(1.2, Math.max(0.8, Number((currentScale + change).toFixed(2))));
    saveConfigurations();
    applyConfigurations();
    refreshControls();
  };

  scopeSelect.addEventListener('change', refreshControls);
  fontSelect.addEventListener('change', () => {
    configurations[scopeSelect.value].font = fontSelect.value === 'inherit' ? null : fontSelect.value;
    saveConfigurations();
    applyConfigurations();
  });
  decrease.addEventListener('click', () => updateScale(-0.05));
  reset.addEventListener('click', () => updateScale(0));
  increase.addEventListener('click', () => updateScale(0.05));

  control.append(summary, scopeField, fontField, sizeField, note);
  document.body.append(control);
  applyConfigurations();
  refreshControls();

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(applyConfigurations);
  });
})();
