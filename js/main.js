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

  const COACH_DESCRIPTIONS = {
    'Henrique Soares': {
      pt: 'Faixa preta · Educação Física',
      en: 'Black belt · Physical Education'
    },
    'Vasco Leal': {
      pt: 'Faixa preta · Treinador de Jiu-Jitsu',
      en: 'Black belt · Jiu-Jitsu coach'
    },
    'Luana Oliveira': {
      pt: 'Faixa preta',
      en: 'Black belt'
    },
    'Francisco Rocha': {
      pt: 'Faixa castanha · Programa Kids',
      en: 'Brown belt · Kids Program'
    },
    'Pedro Zogbi': {
      pt: 'Faixa castanha',
      en: 'Brown belt'
    },
    'Thallysson Vasconcelos': {
      pt: 'Faixa roxa',
      en: 'Purple belt'
    },
    'Ricardo Almeida': {
      pt: 'Faixa roxa · Professor e atleta',
      en: 'Purple belt · Instructor and athlete'
    }
  };

  const TEAM_ORDER = [
    'Henrique Soares',
    'Vasco Leal',
    'Luana Oliveira',
    'Francisco Rocha',
    'Pedro Zogbi',
    'Thallysson Vasconcelos',
    'Ricardo Almeida'
  ];

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
      // The language switch still works when browser storage is unavailable.
    }
  }

  function restoreVisitFocusLinks() {
    queryAll('.academy-menu .nav-dropdown a').forEach((link) => {
      const wasReplaced =
        link.dataset.pt === 'Marcar Aula Experimental' ||
        link.dataset.en === 'Book a Trial Class' ||
        link.href.includes('wa.me/351932665662');

      if (!wasReplaced) return;

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
    card.className = 'coach-card compact-coach-card reveal';
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
      </div>
    `;
    return card;
  }

  function convertLeaderCard(card) {
    card.className = 'coach-card leadership-card reveal';
    card.querySelector('.team-leader-photo')?.classList.replace('team-leader-photo', 'coach-card-photo');
    card.querySelector('.team-leader-content')?.classList.replace('team-leader-content', 'coach-card-content');
    card.querySelector('.coach-kicker')?.classList.replace('coach-kicker', 'coach-rank');
    card.querySelector('.team-leader-role')?.classList.replace('team-leader-role', 'coach-role');
    card.querySelector('.team-leader-achievements')?.classList.remove('team-leader-achievements');

    const heading = card.querySelector('h2');
    if (heading) {
      const replacement = document.createElement('h3');
      replacement.innerHTML = heading.innerHTML;
      heading.replaceWith(replacement);
    }

    return card;
  }

  function simplifyCoachCard(card) {
    const content = card.querySelector('.coach-card-content');
    const heading = content?.querySelector('h3');
    if (!content || !heading) return;

    const name = heading.textContent.trim();
    const description = COACH_DESCRIPTIONS[name];
    let rank = content.querySelector('.coach-rank');

    if (!rank) {
      rank = document.createElement('p');
      rank.className = 'coach-rank';
      content.prepend(rank);
    }

    if (description) {
      rank.dataset.pt = description.pt;
      rank.dataset.en = description.en;
      rank.textContent = description.pt;
    }

    queryAll('.coach-role, ul, p:not(.coach-rank)', content).forEach((element) => element.remove());
    card.classList.add('compact-coach-card');
  }

  function prepareTeamGrid() {
    if (document.body.dataset.page !== 'academy-equipa') return;

    const sectionShell = document.querySelector('#equipa > .section-shell');
    if (!sectionShell) return;

    let uniformGrid = sectionShell.querySelector('.team-uniform-grid');

    if (!uniformGrid) {
      const leadershipGrid = sectionShell.querySelector('.team-leadership-grid');
      const coachesGrid = sectionShell.querySelector('.team-ordered-grid, .coaches-grid');
      if (!leadershipGrid || !coachesGrid) return;

      const leaderCards = queryAll('.team-leader-card', leadershipGrid).map(convertLeaderCard);
      const remainingCards = queryAll('.coach-card', coachesGrid);
      const findCard = (name) => remainingCards.find(
        (card) => card.querySelector('h3')?.textContent.trim() === name
      );

      if (!findCard('Luana Oliveira')) remainingCards.push(createLuanaCard());

      const orderedCards = TEAM_ORDER.map(findCard).filter(Boolean);
      remainingCards.forEach((card) => {
        if (!orderedCards.includes(card)) orderedCards.push(card);
      });

      orderedCards.forEach(simplifyCoachCard);

      uniformGrid = document.createElement('div');
      uniformGrid.className = 'coaches-grid team-uniform-grid';
      uniformGrid.append(...leaderCards, ...orderedCards);
      leadershipGrid.replaceWith(uniformGrid);
      coachesGrid.remove();
    } else {
      queryAll('.coach-card:not(.leadership-card)', uniformGrid).forEach(simplifyCoachCard);
    }

    document.getElementById('team-uniform-layout-v55')?.remove();
    document.getElementById('team-uniform-layout-v56')?.remove();

    const style = document.createElement('style');
    style.id = 'team-uniform-layout-v56';
    style.textContent = `
      body[data-page="academy-equipa"] #equipa .team-uniform-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: clamp(44px, 5vw, 72px) clamp(24px, 2.8vw, 38px);
        align-items: start;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card {
        display: flex;
        flex-direction: column;
        min-width: 0;
        height: 100%;
        overflow: hidden;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card {
        grid-column: span 3;
        color: #fff;
        border: 1px solid #1c1c1c;
        background: #0a0a0a;
        box-shadow: 0 16px 42px rgba(5, 5, 5, 0.12);
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card:nth-child(n + 3) {
        grid-column: span 2;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card-photo {
        display: flex !important;
        align-items: flex-end;
        justify-content: center;
        width: 100%;
        height: auto !important;
        min-height: 0 !important;
        aspect-ratio: 4 / 5 !important;
        padding: 0 !important;
        overflow: hidden;
        border: 0 !important;
        outline: 0 !important;
        background: #e7e7e3;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card .coach-card-photo {
        aspect-ratio: 3 / 2 !important;
        background: #dededb;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card-photo::before,
      body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card-photo::after,
      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card::before {
        display: none !important;
        content: none !important;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card-photo img {
        display: block;
        width: 100%;
        height: 100%;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        outline: 0 !important;
        object-fit: contain !important;
        object-position: center bottom !important;
        filter: none;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card-photo img.is-placeholder {
        object-fit: cover !important;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .compact-coach-card .coach-card-content {
        display: flex !important;
        flex-direction: column;
        min-height: 8.5rem;
        padding: 20px 0 0 !important;
        border: 0 !important;
        background: transparent;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .compact-coach-card .coach-rank {
        min-height: 2.8em;
        margin: 0 0 12px !important;
        color: #656560;
        font-size: 0.72rem;
        font-weight: 700;
        line-height: 1.4;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .compact-coach-card h3 {
        min-height: 0;
        margin: 0 !important;
        font-family: var(--display);
        font-size: clamp(2.15rem, 3vw, 3.35rem);
        line-height: 0.94;
        letter-spacing: -0.03em;
        text-transform: uppercase;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card .coach-card-content {
        display: grid !important;
        flex: 1;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: 2.8rem 4.8rem 3rem minmax(0, 1fr) !important;
        gap: 0 !important;
        min-height: 17rem !important;
        padding: clamp(24px, 2.6vw, 34px) !important;
        border: 0 !important;
        background: #0a0a0a;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card .coach-rank {
        grid-row: 1;
        align-self: start;
        width: fit-content;
        margin: 0 !important;
        padding: 0.42rem 0.64rem;
        color: rgba(255, 255, 255, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.22);
        font-size: 0.7rem;
        font-weight: 650;
        line-height: 1;
        letter-spacing: 0.045em;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card h3 {
        grid-row: 2;
        align-self: start;
        margin: 0 !important;
        color: #fff;
        font-size: clamp(1.9rem, 2.35vw, 2.55rem);
        font-weight: 600;
        line-height: 1.04;
        letter-spacing: -0.025em;
        text-transform: none;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card .coach-role {
        grid-row: 3;
        align-self: start;
        margin: 0 !important;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.78rem;
        font-weight: 600;
        line-height: 1.35;
        letter-spacing: 0.025em;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card > .coach-card-content > ul,
      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card > .coach-card-content > p:not(.coach-rank):not(.coach-role) {
        grid-row: 4;
        align-self: start;
        margin: 0 !important;
        padding-top: 20px;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card ul {
        display: grid;
        gap: 0.58rem;
        padding-left: 1.15rem;
      }

      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card li,
      body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card p:not(.coach-rank):not(.coach-role) {
        color: rgba(255, 255, 255, 0.74);
        font-size: 0.94rem;
        line-height: 1.5;
      }

      @media (max-width: 980px) {
        body[data-page="academy-equipa"] #equipa .team-uniform-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card,
        body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card:nth-child(n + 3) {
          grid-column: span 1;
        }
      }

      @media (max-width: 760px) {
        body[data-page="academy-equipa"] #equipa .team-uniform-grid {
          grid-template-columns: 1fr;
        }

        body[data-page="academy-equipa"] #equipa .team-uniform-grid .leadership-card .coach-card-photo,
        body[data-page="academy-equipa"] #equipa .team-uniform-grid .coach-card-photo {
          aspect-ratio: 4 / 5 !important;
        }

        body[data-page="academy-equipa"] #equipa .team-uniform-grid .compact-coach-card .coach-card-content {
          min-height: 0;
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