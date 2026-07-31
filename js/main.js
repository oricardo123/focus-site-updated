// Keep the Adult Programs dropdown complete on every page.
document.querySelectorAll('.nav-program-group').forEach((group) => {
  const heading = group.querySelector('.nav-program-heading');
  const headingHref = heading?.getAttribute('href') || '';

  if (!headingHref.includes('adultos.html')) return;
  if (group.querySelector('a[href="adultos.html#feminino"]')) return;

  const womenLink = document.createElement('a');
  womenLink.href = 'adultos.html#feminino';
  womenLink.dataset.pt = 'Feminino';
  womenLink.dataset.en = 'Women';
  womenLink.textContent = 'Feminino';
  group.append(womenLink);
});

const languageButtons = document.querySelectorAll('.language-button');
const translatableElements = document.querySelectorAll('[data-pt][data-en]');
const whatsappLinks = document.querySelectorAll('[data-whatsapp]');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-nav');
const navigationLinks = document.querySelectorAll('.main-nav a');
const dropdownItems = document.querySelectorAll('[data-nav-dropdown]');
const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');
const header = document.querySelector('.site-header');
const revealElements = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section[id]');

const whatsappUrls = {
  pt: 'https://wa.me/351932665662?text=Ol%C3%A1%21%20Gostaria%20de%20marcar%20uma%20aula%20experimental%20gratuita%20na%20Focus%20Jiu-Jitsu%20HQ',
  en: 'https://wa.me/351932665662?text=Hello%21%20I%20would%20like%20to%20book%20a%20free%20trial%20class%20at%20Focus%20Jiu-Jitsu%20HQ'
};

function setLanguage(language) {
  const safeLanguage = language === 'en' ? 'en' : 'pt';

  document.documentElement.lang = safeLanguage;

  translatableElements.forEach((element) => {
    element.textContent = element.dataset[safeLanguage];
  });

  whatsappLinks.forEach((link) => {
    link.href = whatsappUrls[safeLanguage];
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === safeLanguage;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  localStorage.setItem('focus-language', safeLanguage);
}

function closeMenu() {
  if (!menuButton || !navigation) return;

  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  closeDropdowns();
  menuButton.setAttribute('aria-expanded', 'false');
}

function closeDropdowns(exceptItem = null) {
  dropdownItems.forEach((item) => {
    if (item === exceptItem) return;

    item.classList.remove('is-open');
    const trigger = item.querySelector('.nav-dropdown-trigger');
    trigger?.setAttribute('aria-expanded', 'false');
  });
}

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 36);
}

function updateActiveNavigation() {
  let currentId = '';
  const activationPoint = window.scrollY + window.innerHeight * 0.38;

  sections.forEach((section) => {
    if (section.offsetTop <= activationPoint) {
      currentId = section.id;
    }
  });

  navigationLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isLocalSection = href.startsWith('#');
    link.classList.toggle('is-active', isLocalSection && href === `#${currentId}`);
  });
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.language));
});

dropdownTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();

    const item = trigger.closest('[data-nav-dropdown]');
    if (!item) return;

    const willOpen = !item.classList.contains('is-open');
    closeDropdowns(item);
    item.classList.toggle('is-open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-nav-dropdown]')) {
    closeDropdowns();
  }
});

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      navigation.scrollTop = 0;
    }
  });

  navigationLinks.forEach((link) => link.addEventListener('click', closeMenu));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDropdowns();
      closeMenu();
    }
  });
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -8% 0px'
});

revealElements.forEach((element) => revealObserver.observe(element));


window.addEventListener('scroll', () => {
  updateHeader();
  updateActiveNavigation();
}, { passive: true });

window.addEventListener('resize', () => {
  if (window.innerWidth > 1120) closeMenu();
});

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

setLanguage(localStorage.getItem('focus-language') || 'pt');
updateHeader();
updateActiveNavigation();


/* Product colour selector */
document.querySelectorAll('[data-product-card]').forEach((card) => {
  const productImage = card.querySelector('[data-product-image]');
  const colourButtons = card.querySelectorAll('[data-product-color]');

  if (!productImage || !colourButtons.length) return;

  const showFallback = () => {
    const fallback = productImage.dataset.fallback;
    if (!fallback || productImage.src.endsWith(fallback)) return;
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
        productImage.src = productImage.dataset.fallback;
        if (nextAlt) productImage.alt = nextAlt;
        productImage.classList.remove('is-changing');
      });

      preloadImage.src = nextImage;
    });
  });
});
