(() => {
  'use strict';

  const SELECTORS = {
    header: '.site-header',
    menuButton: '.menu-button',
    navigation: '.main-nav',
    navigationLinks: '.main-nav a',
    dropdownItems: '[data-nav-dropdown]',
    dropdownTriggers: '.nav-dropdown-trigger',
    primaryNavigationItems: '[data-nav-section]',
    languageButtons: '.language-button',
    translatableElements: '[data-pt][data-en]',
    translatableAriaLabels: '[data-aria-pt][data-aria-en]',
    translatableAltText: '[data-alt-pt][data-alt-en]',
    translatableContent: '[data-content-pt][data-content-en]',
    whatsappLinks: '[data-whatsapp]',
    revealElements: '.reveal'
  };

  const WHATSAPP_URLS = {
    pt: 'https://wa.me/351932665662?text=Ol%C3%A1%2C%20gostaria%20de%20marcar%20uma%20aula%20experimental.',
    en: 'https://wa.me/351932665662?text=Hello%2C%20I%20would%20like%20to%20book%20a%20trial%20class.'
  };

  const DESKTOP_BREAKPOINT = 1120;
  const HEADER_SCROLL_THRESHOLD = 36;
  const queryAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function readStoredLanguage() {
    try {
      return localStorage.getItem('focus-language');
    } catch {
      return null;
    }
  }

  function storeLanguage(language) {
    try {
      localStorage.setItem('focus-language', language);
    } catch {
      // The website remains usable when storage is unavailable.
    }
  }

  function initialiseWebsite() {
    const elements = {
      header: document.querySelector(SELECTORS.header),
      menuButton: document.querySelector(SELECTORS.menuButton),
      navigation: document.querySelector(SELECTORS.navigation),
      navigationLinks: queryAll(SELECTORS.navigationLinks),
      dropdownItems: queryAll(SELECTORS.dropdownItems),
      dropdownTriggers: queryAll(SELECTORS.dropdownTriggers),
      primaryNavigationItems: queryAll(SELECTORS.primaryNavigationItems),
      languageButtons: queryAll(SELECTORS.languageButtons),
      translatableElements: queryAll(SELECTORS.translatableElements),
      translatableAriaLabels: queryAll(SELECTORS.translatableAriaLabels),
      translatableAltText: queryAll(SELECTORS.translatableAltText),
      translatableContent: queryAll(SELECTORS.translatableContent),
      whatsappLinks: queryAll(SELECTORS.whatsappLinks),
      revealElements: queryAll(SELECTORS.revealElements)
    };

    function setLanguage(language) {
      const safeLanguage = language === 'en' ? 'en' : 'pt';
      const languageSuffix = safeLanguage === 'en' ? 'En' : 'Pt';
      document.documentElement.lang = safeLanguage;

      elements.translatableElements.forEach((element) => {
        const translatedText = element.dataset[safeLanguage];
        if (typeof translatedText === 'string') element.textContent = translatedText;
      });

      elements.translatableAriaLabels.forEach((element) => {
        element.setAttribute('aria-label', element.dataset[`aria${languageSuffix}`]);
      });

      elements.translatableAltText.forEach((element) => {
        element.alt = element.dataset[`alt${languageSuffix}`];
      });

      elements.translatableContent.forEach((element) => {
        element.content = element.dataset[`content${languageSuffix}`];
      });

      elements.whatsappLinks.forEach((link) => {
        link.href = WHATSAPP_URLS[safeLanguage];
      });

      elements.languageButtons.forEach((button) => {
        const isActive = button.dataset.language === safeLanguage;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      storeLanguage(safeLanguage);
    }

    function closeDropdowns(exceptItem = null) {
      elements.dropdownItems.forEach((item) => {
        if (item === exceptItem) return;
        item.classList.remove('is-open');
        item.querySelector(SELECTORS.dropdownTriggers)?.setAttribute('aria-expanded', 'false');
      });
    }

    function closeMenu() {
      if (!elements.menuButton || !elements.navigation) return;
      elements.navigation.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      elements.menuButton.setAttribute('aria-expanded', 'false');
      closeDropdowns();
    }

    function updateHeader() {
      elements.header?.classList.toggle('is-scrolled', window.scrollY > HEADER_SCROLL_THRESHOLD);
    }

    function getCurrentPrimarySection() {
      const page = document.body.dataset.page || '';
      const hash = window.location.hash;

      if (page === 'home' && hash === '#academy') return 'academy';
      if (page === 'home' && hash === '#programs') return 'programs';
      if (page.startsWith('academy')) return 'academy';
      if (page.startsWith('programs')) return 'programs';
      if (page === 'schedule') return 'schedule';
      if (page === 'products') return 'products';
      if (page.startsWith('locations')) return 'locations';
      return '';
    }

    function updateCurrentPrimaryNavigation() {
      const currentSection = getCurrentPrimarySection();

      elements.primaryNavigationItems.forEach((item) => {
        const isCurrent = item.dataset.navSection === currentSection;
        item.classList.toggle('is-current', isCurrent);

        const primaryLink = item.matches('a') ? item : item.querySelector('.nav-parent-link');
        if (!primaryLink) return;

        if (isCurrent) primaryLink.setAttribute('aria-current', 'page');
        else primaryLink.removeAttribute('aria-current');
      });
    }

    function initialiseLanguageSwitch() {
      elements.languageButtons.forEach((button) => {
        button.addEventListener('click', () => setLanguage(button.dataset.language));
      });
      setLanguage(readStoredLanguage() || 'pt');
    }

    function initialiseDropdowns() {
      elements.dropdownTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
          event.stopPropagation();
          const item = trigger.closest(SELECTORS.dropdownItems);
          if (!item) return;

          const willOpen = !item.classList.contains('is-open');
          closeDropdowns(item);
          item.classList.toggle('is-open', willOpen);
          trigger.setAttribute('aria-expanded', String(willOpen));
        });
      });

      document.addEventListener('click', (event) => {
        if (!event.target.closest(SELECTORS.dropdownItems)) closeDropdowns();
      });
    }

    function initialiseMobileMenu() {
      if (!elements.menuButton || !elements.navigation) return;

      elements.menuButton.addEventListener('click', () => {
        const isOpen = elements.navigation.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', isOpen);
        elements.menuButton.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) elements.navigation.scrollTop = 0;
      });

      elements.navigationLinks.forEach((link) => link.addEventListener('click', closeMenu));

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closeDropdowns();
        closeMenu();
      });
    }

    function initialiseRevealAnimations() {
      if (!('IntersectionObserver' in window)) {
        elements.revealElements.forEach((element) => element.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver((entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
      });

      elements.revealElements.forEach((element) => observer.observe(element));
    }

    function respectReducedMotion() {
      if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      queryAll('.hero video[autoplay]').forEach((video) => {
        video.removeAttribute('autoplay');
        video.pause();
      });
    }

    function initialiseTypographyLab() {
      if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return;

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
        { value: 'fjalla-lato', label: '14 · Fjalla One + Lato', display: '"Fjalla One", "Arial Narrow", Arial, sans-serif', body: '"Lato", Arial, Helvetica, sans-serif' }
      ];
      const fontMap = new Map(fonts.map((font) => [font.value, font]));
      const scopes = [
        { value: 'all', label: 'Site completo', selector: 'main h1, main h2, main h3, main h4, main p, main li, main a, main button, .site-header a, .site-header button, .site-footer p, .site-footer a, .site-footer span, .site-footer li, .floating-whatsapp' },
        { value: 'titles', label: 'Títulos', selector: 'main h1, main h2, main h3, main h4' },
        { value: 'copy', label: 'Texto principal', selector: 'main p:not(.eyebrow):not([class*="kicker"]):not([class*="label"]):not([class*="meta"]), main li' },
        { value: 'navigation', label: 'Navegação', selector: '.site-header a, .site-header button, .breadcrumb a, .breadcrumb span' },
        { value: 'controls', label: 'Botões e etiquetas', selector: 'main a, main button, .floating-whatsapp' },
        { value: 'footer', label: 'Rodapé', selector: '.site-footer p, .site-footer a, .site-footer span, .site-footer li' },
        { value: 'academy', label: 'A Academia · texto', selector: '.philosophy-editorial-copy p' }
      ];
      const scopeOrder = scopes.map((scope) => scope.value);
      const scopeElements = new Map(scopes.map((scope) => [scope.value, queryAll(scope.selector)]));
      const allElements = [...new Set(scopes.flatMap((scope) => scopeElements.get(scope.value)))];
      const originalStyles = new WeakMap(allElements.map((element) => [element, {
        fontFamily: element.style.fontFamily,
        fontSize: element.style.fontSize
      }]));
      const configurations = Object.fromEntries(scopes.map((scope) => [scope.value, { font: null, scale: null }]));

      try {
        const storedConfigurations = JSON.parse(localStorage.getItem('focus-typography-lab-v2') || '{}');
        scopes.forEach(({ value }) => {
          const stored = storedConfigurations[value];
          if (!stored || typeof stored !== 'object') return;
          if (fontMap.has(stored.font)) configurations[value].font = stored.font;
          if (Number.isFinite(stored.scale)) configurations[value].scale = Math.min(1.2, Math.max(0.8, stored.scale));
        });
      } catch {
        // Start with the website's existing settings.
      }

      const saveConfigurations = () => {
        try {
          localStorage.setItem('focus-typography-lab-v2', JSON.stringify(configurations));
        } catch {
          // The laboratory remains usable when storage is unavailable.
        }
      };

      const applyConfigurations = () => {
        allElements.forEach((element) => {
          const original = originalStyles.get(element);
          element.style.fontFamily = original.fontFamily;
          element.style.fontSize = original.fontSize;
        });

        scopeOrder.forEach((scopeValue) => {
          const configuration = configurations[scopeValue];
          const font = fontMap.get(configuration.font);
          if (!font) return;
          scopeElements.get(scopeValue).forEach((element) => {
            const usesDisplayFont = element.matches('h1, h2, h3, h4');
            element.style.fontFamily = usesDisplayFont ? font.display : font.body;
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

      const fontStylesheet = document.createElement('link');
      fontStylesheet.rel = 'stylesheet';
      fontStylesheet.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=Archivo+Narrow:wght@500;600;700&family=Barlow+Condensed:wght@500;600;700&family=Bebas+Neue&family=Fjalla+One&family=IBM+Plex+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=League+Gothic&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Roboto+Condensed:wght@500;600;700&family=Sora:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Teko:wght@500;600;700&display=swap';
      document.head.append(fontStylesheet);

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
    }

    let scrollFrameRequested = false;
    function handleScroll() {
      if (scrollFrameRequested) return;
      scrollFrameRequested = true;
      requestAnimationFrame(() => {
        updateHeader();
        scrollFrameRequested = false;
      });
    }

    initialiseLanguageSwitch();
    initialiseDropdowns();
    initialiseMobileMenu();
    initialiseRevealAnimations();
    respectReducedMotion();
    initialiseTypographyLab();

    updateHeader();
    updateCurrentPrimaryNavigation();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', updateCurrentPrimaryNavigation);
    window.addEventListener('resize', () => {
      if (window.innerWidth > DESKTOP_BREAKPOINT) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseWebsite, { once: true });
  } else {
    initialiseWebsite();
  }
})();
