(() => {
  'use strict';

  const getLanguage = () => document.documentElement.lang === 'en' ? 'en' : 'pt';
  const normaliseIndex = (index, total) => ((index % total) + total) % total;

  document.addEventListener('DOMContentLoaded', () => {
    const galleryUpdates = [];

    document.querySelectorAll('[data-product-gallery]').forEach((card) => {
      const image = card.querySelector('[data-product-image]');
      const stage = card.querySelector('[data-gallery-stage]');
      const counter = card.querySelector('[data-gallery-counter]');
      const status = card.querySelector('[data-gallery-status]');
      const colourGroup = card.querySelector('.product-colors');
      const colourButtons = Array.from(card.querySelectorAll('[data-gallery-color]'));
      const arrowButtons = Array.from(card.querySelectorAll('[data-gallery-step]'));
      const previousButton = card.querySelector('[data-gallery-step="-1"]');
      const nextButton = card.querySelector('[data-gallery-step="1"]');
      const model = card.dataset.productModel || '';

      if (!image || !stage || colourButtons.length === 0 || arrowButtons.length !== 2) return;

      let currentIndex = 0;
      let requestedIndex = 0;
      let loadSequence = 0;

      const getActiveColour = () => (
        colourButtons.find((button) => button.classList.contains('is-active')) || colourButtons[0]
      );

      const getPhotos = () => (
        (getActiveColour().dataset.images || '').split('|').filter(Boolean)
      );

      const getColourName = () => {
        const language = getLanguage();
        const colour = getActiveColour();
        return colour.getAttribute(`data-color-${language}`) || model;
      };

      const getPhotoLabel = (index, total) => {
        const colourName = getColourName();
        return getLanguage() === 'en'
          ? `${colourName} — product photo ${index + 1} of ${total}`
          : `${colourName} — fotografia do produto ${index + 1} de ${total}`;
      };

      const updateSwatchLabels = () => {
        const language = getLanguage();
        colourButtons.forEach((button) => {
          const label = button.getAttribute(`data-color-${language}`);
          if (label) button.setAttribute('aria-label', label);
        });
        if (colourGroup) {
          colourGroup.setAttribute(
            'aria-label',
            language === 'en' ? 'Available colours' : 'Cores disponíveis'
          );
        }
      };

      const updateGalleryText = (announce = false) => {
        const photos = getPhotos();
        const total = photos.length;
        if (total === 0) return;

        const language = getLanguage();
        const photoLabel = getPhotoLabel(currentIndex, total);
        const hasMultiplePhotos = total > 1;

        image.alt = photoLabel;
        stage.setAttribute(
          'aria-label',
          language === 'en' ? `${model} product photos` : `Fotografias do ${model}`
        );
        previousButton.setAttribute(
          'aria-label',
          language === 'en' ? `Previous ${model} photo` : `Fotografia anterior do ${model}`
        );
        nextButton.setAttribute(
          'aria-label',
          language === 'en' ? `Next ${model} photo` : `Fotografia seguinte do ${model}`
        );

        arrowButtons.forEach((button) => { button.hidden = !hasMultiplePhotos; });
        if (counter) {
          counter.hidden = !hasMultiplePhotos;
          counter.textContent = `${currentIndex + 1} / ${total}`;
        }
        if (announce && status) status.textContent = photoLabel;

        updateSwatchLabels();
        card.classList.add('is-gallery-ready');
      };

      const preloadAdjacentPhotos = () => {
        const photos = getPhotos();
        if (photos.length < 2) return;

        const indexes = new Set([
          normaliseIndex(currentIndex - 1, photos.length),
          normaliseIndex(currentIndex + 1, photos.length)
        ]);
        indexes.forEach((index) => {
          const preload = new Image();
          preload.src = photos[index];
        });
      };

      const showPhoto = (index, { announce = true } = {}) => {
        const photos = getPhotos();
        if (photos.length === 0) return;

        const targetIndex = normaliseIndex(index, photos.length);
        const targetPath = photos[targetIndex];
        const targetUrl = new URL(targetPath, window.location.href).href;
        const requestId = ++loadSequence;
        requestedIndex = targetIndex;

        const commit = () => {
          if (requestId !== loadSequence) return;
          image.src = targetPath;
          currentIndex = targetIndex;
          requestedIndex = targetIndex;
          card.removeAttribute('aria-busy');
          updateGalleryText(announce);
          preloadAdjacentPhotos();
        };

        if (image.src === targetUrl) {
          commit();
          return;
        }

        card.setAttribute('aria-busy', 'true');
        const preload = new Image();
        preload.addEventListener('load', commit, { once: true });
        preload.addEventListener('error', () => {
          if (requestId !== loadSequence) return;
          requestedIndex = currentIndex;
          card.removeAttribute('aria-busy');
          if (status) {
            status.textContent = getLanguage() === 'en'
              ? `The next ${model} photo could not be loaded.`
              : `Não foi possível carregar a fotografia seguinte do ${model}.`;
          }
        }, { once: true });
        preload.src = targetPath;
      };

      arrowButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const step = Number(button.dataset.galleryStep) || 0;
          showPhoto(requestedIndex + step);
        });
      });

      colourButtons.forEach((button) => {
        button.addEventListener('click', () => {
          colourButtons.forEach((otherButton) => {
            const isSelected = otherButton === button;
            otherButton.classList.toggle('is-active', isSelected);
            otherButton.setAttribute('aria-pressed', String(isSelected));
          });
          requestedIndex = 0;
          showPhoto(0);
        });
      });

      const updateLanguage = () => updateGalleryText(false);
      galleryUpdates.push(updateLanguage);
      showPhoto(0, { announce: false });
    });

    document.querySelectorAll('.language-button').forEach((button) => {
      button.addEventListener('click', () => {
        requestAnimationFrame(() => galleryUpdates.forEach((update) => update()));
      });
    });
  });
})();
