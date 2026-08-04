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

  function restoreVisitFocusLinks() {
    queryAll('.academy-menu .nav-dropdown a').forEach((link) => {
      const replacedByTrialLink =
        link.dataset.pt === 'Marcar Aula Experimental' ||
        link.dataset.en === 'Book a Trial Class' ||
        link.href.includes('wa.me/351932665662');

      if (!replacedByTrialLink) return;

      link.classList.remove('whatsapp-link');
      delete link.dataset.whatsapp;
      link.dataset.pt = 'Visitar Focus Jiu-Jitsu HQ';
      link.dataset.en = 'Visit Focus Jiu-Jitsu HQ';
      link.href = 'visitar.html';
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.textContent = link.dataset.pt;
    });
  }

  function createLuanaCard() {
    const card = document.createElement('article');
    card.className = 'coach-card reveal';
    card.innerHTML = `
      <div class="coach-card-photo">
        <img
          alt="Luana Oliveira"
          loading="lazy"
          src="assets/images/team/luana-oliveira.jpg"
          onerror="this.onerror=null;this.src='assets/images/team/team-placeholder.svg';this.classList.add('is-placeholder');"
        />
      </div>
      <div class="coach-card-content">
        <p class="coach-rank" data-en="Black belt" data-pt="Faixa preta">Faixa preta</p>
        <h3>Luana Oliveira</h3>
        <p class="coach-role" data-en="Instructor" data-pt="Professora">Professora</p>
      </div>
    `;
    return card;
  }

  function prepareTeamGrid() {
    if (document.body.dataset.page !== 'academy-equipa') return;

    const sectionShell = document.querySelector('#equipa > .section-shell');
    const leadershipGrid = sectionShell?.querySelector('.team-leadership-grid');
    const coachesGrid = sectionShell?.querySelector('.team-ordered-grid, .coaches-grid');
    if (!sectionShell || !leadershipGrid || !coachesGrid) return;

    const convertLeaderCard = (card) => {
      card.className = 'coach-card leadership-card reveal';

      card.querySelector('.team-leader-photo')?.classList.replace('team-leader-photo', 'coach-card-photo');
      card.querySelector('.team-leader-content')?.classList.replace('team-leader-content', 'coach-card-content');
      card.querySelector('.coach-kicker')?.classList.replace('coach-kicker', 'coach-rank');
      card.querySelector('.team-leader-role')?.classList.replace('team-leader-role', 'coach-role');
      card.querySelector('.team-leader-achievements')?.classList.remove('team-leader-achievements');

      const heading = card.querySelector('h2');
      if (heading) {
        const replacementHeading = document.createElement('h3');
        replacementHeading.innerHTML = heading.innerHTML;
        heading.replaceWith(replacementHeading);
      }

      return card;
    };

    const leaderCards = queryAll('.team-leader-card', leadershipGrid).map(convertLeaderCard);
    const remainingCards = queryAll('.coach-card', coachesGrid);
    const findCoachCard = (name) => remainingCards.find(
      (card) => card.querySelector('h3')?.textContent.trim() === name
    );

    if (!findCoachCard('Luana Oliveira')) remainingCards.push(createLuanaCard());

    const vascoRank = findCoachCard('Vasco Leal')?.querySelector('.coach-rank');
    if (vascoRank) {
      vascoRank.dataset.pt = 'Faixa preta · Curso de treinador de Jiu-Jitsu';
      vascoRank.dataset.en = 'Black belt · Jiu-Jitsu coach training';
      vascoRank.textContent = vascoRank.dataset.pt;
    }

    const preferredOrder = [
      'Henrique Soares',
      'Vasco Leal',
      'Luana Oliveira',
      'Francisco Rocha',
      'Pedro Zogbi',
      'Thallysson Vasconcelos',
      'Ricardo Almeida'
    ];

    const orderedRemainingCards = preferredOrder.map(findCoachCard).filter(Boolean);
    remainingCards.forEach((card) => {
      if (!orderedRemainingCards.includes(card)) orderedRemainingCards.push(card);
    });

    const uniformGrid = document.createElement('div');
    uniformGrid.className = 'coaches-grid team-uniform-grid';
    uniformGrid.append(...leaderCards, ...orderedRemainingCards);

    leadershipGrid.replaceWith(uniformGrid);
    coachesGrid.remove();

    if (document.getElementById('team-uniform-layout')) return;

    const style = document.createElement('style');
    style.id = 'team-uniform-layout';
    style.textContent = `
      body[data-page="academy-equipa"] .team-uniform-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: clamp(20px, 2.2vw, 34px);
        align-items: stretch;
      }

      body[data-page="academy-equipa"] .team-uniform-grid .coach-card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      body[data-page="academy-equipa"] .team-uniform-grid .leadership-card {
        position: relative;
        grid-column: span 3;
        overflow: hidden;
        color: #fff;
        border: 1px solid #181818;
        background: #0b0b0b;
        box-shadow: 0 22px 60px rgba(5, 5, 5, 0.16);
      }

      body[data-page="academy-equipa"] .team-uniform-grid .leadership-card::before {
        content: '';
        position: absolute;
        z-index: 3;
        top: 0;
        right: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #fff 0 20%, rgba(255, 255, 255, 0.22) 20% 100%);
      }

      body[data-page="academy-equipa"] .leadership-card .coach-card-photo {
        position: relative;
        overflow: hidden;
        background: #111;
      }

      body[data-page="academy-equipa"] .leadership-card .coach-card-photo::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        height: 32%;
        pointer-events: none;
        background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.2));
      }

      body[data-page="academy-equipa"] .leadership-card .coach-card-photo img {
        filter: saturate(0.94) contrast(1.03);
      }

      body[data-page="academy-equipa"] .leadership-card .coach-card-content {
        background: #0b0b0b;
      }

      body[data-page="academy-equipa"] .leadership-card h3 {
        color: #fff;
        font-size: clamp(1.75rem, 2.35vw, 2.55rem);
      }

      body[data-page="academy-equipa"] .leadership-card .coach-rank {
        display: inline-flex;
        width: fit-content;
        padding: 0.38rem 0.62rem;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.28);
        font-weight: 700;
        letter-spacing: 0.1em;
      }

      body[data-page="academy-equipa"] .leadership-card .coach-role {
        color: #fff;
        font-weight: 600;
      }

      body[data-page="academy-equipa"] .leadership-card p:not(.coach-rank):not(.coach-role),
      body[data-page="academy-equipa"] .leadership-card li {
        color: rgba(255, 255, 255, 0.72);
      }

      body[data-page="academy-equipa"] .team-uniform-grid .coach-card:nth-child(n + 3) {
        grid-column: span 2;
      }

      body[data-page="academy-equipa"] .team-uniform-grid .coach-card:nth-child(n + 3):last-child:nth-child(3n) {
        grid-column: 3 / span 2;
      }

      body[data-page="academy-equipa"] .team-uniform-grid .coach-card-content {
        flex: 1;
      }

      @media (max-width: 980px) {
        body[data-page="academy-equipa"] .team-uniform-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        body[data-page="academy-equipa"] .team-uniform-grid .coach-card,
        body[data-page="academy-equipa"] .team-uniform-grid .coach-card:nth-child(n + 3):last-child:nth-child(3n) {
          grid-column: span 1;
        }
      }

      @media (max-width: 760px) {
        body[data-page="academy-equipa"] .team-uniform-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.append(style);
  }

  function initialiseWebsite() {
    restoreVisitFocusLinks();
    prepareTeamGrid();

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
