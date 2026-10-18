// Homepage navigation remains native; galleries and project images share one viewer.
const projectImages = document.querySelectorAll('.case-page main .project-image-trigger');
let lightbox = document.querySelector('.lightbox');
if (!lightbox && projectImages.length) {
  lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox lightbox--project';
  lightbox.setAttribute('aria-label', 'Project image viewer');
  lightbox.innerHTML = `
    <div class="lightbox-toolbar"><button class="lightbox-close" type="button" autofocus>Close <span aria-hidden="true">×</span></button></div>
    <div class="lightbox-image media-frame"></div>
    <div class="lightbox-caption"><p class="lightbox-description metadata" id="project-image-caption"></p></div>`;
  document.body.append(lightbox);
}

if (lightbox) {
  const media = lightbox.querySelector('.lightbox-image');
  const title = lightbox.querySelector('.lightbox-title');
  const category = lightbox.querySelector('.lightbox-category');
  const software = lightbox.querySelector('.lightbox-software');
  let opener;
  const openViewer = (trigger) => {
    opener = trigger;
    lightbox.showModal();
    document.body.classList.add('modal-open');
  };

  projectImages.forEach((trigger) => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', () => {
      // Use a fresh image: thumbnail dimensions, classes and crops must not carry over.
      const image = new Image();
      image.alt = trigger.querySelector('img').alt;
      image.src = trigger.dataset.fullSrc || trigger.querySelector('img').currentSrc;
      media.replaceChildren(image);
      const caption = trigger.closest('figure')?.querySelector('figcaption')?.textContent.trim().replace(/\s+/g, ' ') || '';
      lightbox.querySelector('.lightbox-description').textContent = caption;
      lightbox.querySelector('.lightbox-caption').hidden = !caption;
      if (caption) lightbox.setAttribute('aria-describedby', 'project-image-caption');
      else lightbox.removeAttribute('aria-describedby');
      openViewer(trigger);
    });
  });

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.addEventListener('click', () => {
      const source = card.querySelector('.gallery-image');
      if (!source) return;
      media.replaceChildren(...Array.from(source.childNodes, (node) => node.cloneNode(true)));
      const image = media.querySelector('img');
      if (image) {
        image.loading = 'eager';
        if (card.dataset.fullSrc) {
          image.removeAttribute('srcset');
          image.src = card.dataset.fullSrc;
        }
      }
      title.textContent = card.dataset.title || '';
      category.textContent = card.dataset.category || '';
      software.textContent = card.dataset.software || '';
      openViewer(card);
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (lightbox.classList.contains('lightbox--project')) {
      if (!event.target.closest('img, video, button')) lightbox.close();
      return;
    }
    const rect = lightbox.getBoundingClientRect();
    if (event.target === lightbox &&
        (event.clientX < rect.left || event.clientX > rect.right ||
         event.clientY < rect.top || event.clientY > rect.bottom)) {
      lightbox.close();
    }
  });
  // Native dialog supports Escape and keeps keyboard focus inside the viewer.
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    media.replaceChildren();
    opener?.focus();
  });
}
