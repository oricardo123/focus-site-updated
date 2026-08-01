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
    whatsappLinks: '[data-whatsapp]',
    revealElements: '.reveal',
    trackedSections: 'main section[id]',
    productCards: '[data-product-card]'
  };

  const WHATSAPP_URLS = {
    pt: 'https://wa.me/351932665662?text=Ol%C3%A1%21%20Gostaria%20de%20marcar%20uma%20aula%20experimental%20gratuita%20na%20Focus%20Jiu-Jitsu%20HQ',
    en: 'https://wa.me/351932665662?text=Hello%21%20I%20would%20like%20to%20book%20a%20free%20trial%20class%20at%20Focus%20Jiu-Jitsu%20HQ'
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
      // The website remains fully usable when storage is unavailable.
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
      whatsappLinks: queryAll(SELECTORS.whatsappLinks),
      revealElements: queryAll(SELECTORS.revealElements),
      trackedSections: queryAll(SELECTORS.trackedSections)
    };

    function setLanguage(language) {
      const safeLanguage = language === 'en' ? 'en' : 'pt';
      document.documentElement.lang = safeLanguage;

      elements.translatableElements.forEach((element) => {
        const translatedText = element.dataset[safeLanguage];
        if (typeof translatedText === 'string') element.textContent = translatedText;
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

    function updateActiveSectionNavigation() {
      let currentId = '';
      const activationPoint = window.scrollY + window.innerHeight * 0.38;

      elements.trackedSections.forEach((section) => {
        if (section.offsetTop <= activationPoint) currentId = section.id;
      });

      elements.navigationLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const isActiveLocalLink = href.startsWith('#') && href === `#${currentId}`;
        link.classList.toggle('is-active', isActiveLocalLink);
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

    function initialiseProductColourSelectors() {
      queryAll(SELECTORS.productCards).forEach((card) => {
        const productImage = card.querySelector('[data-product-image]');
        const colourButtons = queryAll('[data-product-color]', card);
        if (!productImage || colourButtons.length === 0) return;

        const showFallback = () => {
          const fallback = productImage.dataset.fallback;
          if (!fallback) return;

          const currentPath = new URL(productImage.src, window.location.href).pathname;
          const fallbackPath = new URL(fallback, window.location.href).pathname;
          if (currentPath === fallbackPath) return;

          productImage.src = fallback;
          productImage.classList.remove('is-changing');
        };

        productImage.addEventListener('error', showFallback);

        colourButtons.forEach((button) => {
          button.addEventListener('click', () => {
            const nextImage = button.dataset.image;
            const nextAlt = button.dataset.alt;
            if (!nextImage) return;

            colourButtons.forEach((otherButton) => {
              const isSelected = otherButton === button;
              otherButton.classList.toggle('is-active', isSelected);
              otherButton.setAttribute('aria-pressed', String(isSelected));
            });

            productImage.classList.add('is-changing');
            const preloadImage = new Image();

            preloadImage.addEventListener('load', () => {
              productImage.src = nextImage;
              if (nextAlt) productImage.alt = nextAlt;
              requestAnimationFrame(() => productImage.classList.remove('is-changing'));
            });

            preloadImage.addEventListener('error', () => {
              showFallback();
              if (nextAlt) productImage.alt = nextAlt;
            });

            preloadImage.src = nextImage;
          });
        });
      });
    }

    function initialiseCurrentYear() {
      queryAll('[data-current-year]').forEach((element) => {
        element.textContent = String(new Date().getFullYear());
      });
    }

    let scrollFrameRequested = false;
    function handleScroll() {
      if (scrollFrameRequested) return;
      scrollFrameRequested = true;
      requestAnimationFrame(() => {
        updateHeader();
        updateActiveSectionNavigation();
        scrollFrameRequested = false;
      });
    }

    initialiseLanguageSwitch();
    initialiseDropdowns();
    initialiseMobileMenu();
    initialiseRevealAnimations();
    initialiseProductColourSelectors();
    initialiseCurrentYear();

    updateHeader();
    updateCurrentPrimaryNavigation();
    updateActiveSectionNavigation();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', () => {
      updateCurrentPrimaryNavigation();
      updateActiveSectionNavigation();
    });
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
