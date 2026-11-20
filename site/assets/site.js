/* AD Photography site script. Shared by every page; each part runs only where its elements exist. */
(function () {
  // Links from the old one-page site (adlightstudio.com/#booking and so on) go to the new pages.
  var oldAnchors = { '#work': '/gallery/', '#pricing': '/pricing/', '#team': '/about/', '#book': '/contact/', '#booking': '/contact/' };
  if ((location.pathname === '/' || location.pathname === '/index.html') && oldAnchors[location.hash]) {
    location.replace(oldAnchors[location.hash]);
    return;
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Phone menu
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('is-open')) {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.focus();
      }
    });
  }

  // Gallery filters. A link like /gallery/?category=maternity opens with that filter on.
  var filterButtons = document.querySelectorAll('[data-filter]');
  // Anything with data-category can be filtered: event rows on the Gallery page take a space separated list.
  var tiles = document.querySelectorAll('[data-category]');
  function applyFilter(filter) {
    var known = false;
    filterButtons.forEach(function (b) {
      var on = b.getAttribute('data-filter') === filter;
      if (on) known = true;
      b.setAttribute('aria-pressed', String(on));
    });
    if (!known) return applyFilter('all');
    tiles.forEach(function (tile) {
      tile.hidden = filter !== 'all' && tile.getAttribute('data-category').split(' ').indexOf(filter) === -1;
    });
  }
  if (filterButtons.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter');
        applyFilter(filter);
        if (window.history && history.replaceState) {
          history.replaceState(null, '', filter === 'all' ? location.pathname : location.pathname + '?category=' + filter);
        }
      });
    });
    var startFilter = new URLSearchParams(location.search).get('category');
    if (startFilter) applyFilter(startFilter);
  }

  // Event rows: arrows scroll one screenful sideways. They hide when a row fits and dim at either end.
  document.querySelectorAll('.event-row').forEach(function (row) {
    var track = row.querySelector('.row-track');
    var controls = row.querySelector('.row-controls');
    if (!track || !controls) return;
    var back = controls.querySelector('[data-dir="-1"]');
    var forward = controls.querySelector('[data-dir="1"]');
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      controls.hidden = max <= 4;
      back.disabled = track.scrollLeft <= 4;
      forward.disabled = track.scrollLeft >= max - 4;
    }
    controls.querySelectorAll('.row-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        var dir = Number(button.getAttribute('data-dir'));
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    track.querySelectorAll('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', update); });
    update();
  });

  // Lightbox: full-screen viewer, steps through the photos of one row
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbPhoto = document.getElementById('lightbox-photo');
    var lbThumb = document.getElementById('lightbox-thumb');
    var lbCaption = document.getElementById('lightbox-caption');
    var lbCount = document.getElementById('lightbox-count');
    var lbClose = document.getElementById('lightbox-close');
    var lbPrev = document.getElementById('lightbox-prev');
    var lbNext = document.getElementById('lightbox-next');
    var lbSet = [];
    var lbIndex = 0;
    var lastFocused = null;

    function rowFrames(frame) {
      var row = frame.closest('.event-row') || document;
      return Array.prototype.slice.call(row.querySelectorAll('.photo-frame'));
    }
    function warm(frame) {
      if (!frame) return;
      var pre = new Image();
      pre.sizes = '100vw';
      pre.srcset = frame.getAttribute('data-srcset') || '';
      pre.src = frame.getAttribute('data-src');
    }
    function show(i) {
      lbIndex = (i + lbSet.length) % lbSet.length;
      var frame = lbSet[lbIndex];
      var thumb = frame.querySelector('img');
      lbThumb.src = thumb ? (thumb.currentSrc || thumb.src) : '';
      lbPhoto.classList.remove('is-loaded');
      lbPhoto.removeAttribute('srcset');
      lbPhoto.alt = thumb ? thumb.alt : '';
      lbPhoto.sizes = '100vw';
      if (frame.getAttribute('data-srcset')) lbPhoto.srcset = frame.getAttribute('data-srcset');
      lbPhoto.src = frame.getAttribute('data-src');
      if (lbPhoto.complete && lbPhoto.naturalWidth) lbPhoto.classList.add('is-loaded');
      lbCaption.textContent = frame.getAttribute('data-label') || (thumb && thumb.alt) || '';
      var many = lbSet.length > 1;
      lbCount.textContent = many ? (lbIndex + 1) + ' / ' + lbSet.length : '';
      lbPrev.hidden = !many;
      lbNext.hidden = !many;
      if (many) { warm(lbSet[(lbIndex + 1) % lbSet.length]); warm(lbSet[(lbIndex - 1 + lbSet.length) % lbSet.length]); }
    }
    lbPhoto.addEventListener('load', function () { lbPhoto.classList.add('is-loaded'); });

    document.querySelectorAll('.photo-frame').forEach(function (frame) {
      frame.addEventListener('click', function () {
        lastFocused = frame;
        lbSet = rowFrames(frame);
        show(lbSet.indexOf(frame));
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lbClose.focus();
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbPhoto.removeAttribute('srcset');
      lbPhoto.removeAttribute('src');
      if (lastFocused) lastFocused.focus();
    }
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { show(lbIndex - 1); });
    lbNext.addEventListener('click', function () { show(lbIndex + 1); });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox || event.target.classList.contains('lightbox-image')) closeLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeLightbox();
      else if (event.key === 'ArrowRight') show(lbIndex + 1);
      else if (event.key === 'ArrowLeft') show(lbIndex - 1);
      else if (event.key === 'Tab') {
        var stops = [lbPrev, lbNext, lbClose].filter(function (b) { return !b.hidden; });
        var at = stops.indexOf(document.activeElement);
        event.preventDefault();
        stops[(at + (event.shiftKey ? stops.length - 1 : 1)) % stops.length].focus();
      }
    });

    // Swipe left or right on touch screens
    var startX = null, startY = 0;
    lightbox.addEventListener('touchstart', function (event) {
      if (event.touches.length !== 1 || (window.visualViewport && window.visualViewport.scale > 1.05)) { startX = null; return; }
      startX = event.touches[0].clientX; startY = event.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (event) {
      if (startX === null || lbSet.length < 2) return;
      var dx = event.changedTouches[0].clientX - startX;
      var dy = event.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // Inquiry form
  var form = document.getElementById('inquiry-form');
  if (!form) return;

  var typeSelect = document.getElementById('type');
  var startType = new URLSearchParams(location.search).get('type');
  if (startType) {
    Array.prototype.forEach.call(typeSelect.options, function (option) {
      if (option.value && option.value.toLowerCase() === startType.toLowerCase()) typeSelect.value = option.value;
    });
  }

  var result = document.getElementById('result');
  var resultMessage = document.getElementById('result-message');
  var submitButton = document.getElementById('submit-button');
  var validationFields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    type: typeSelect
  };
  var touchedFields = {};

  function showFieldError(fieldName, message) {
    var input = validationFields[fieldName];
    var error = document.getElementById(fieldName + '-error');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message;
  }

  function cleanPhone(value) {
    // Keep digits and the usual separators; allow one leading + for country codes.
    var cleaned = value.replace(/[^\d+\s().-]/g, '');
    return cleaned.charAt(0) + cleaned.slice(1).replace(/\+/g, '');
  }

  function getFieldError(fieldName) {
    var field = validationFields[fieldName];
    var value = field.value.trim();
    if (fieldName === 'name') {
      return value.length >= 2 && /^[\p{L}]+\.?(?:[ '’.-]+[\p{L}]+\.?)*$/u.test(value)
        ? ''
        : 'Enter at least 2 characters using letters, spaces, hyphens, periods or apostrophes.';
    }
    if (fieldName === 'email') {
      if (!value) return 'Enter your email address.';
      return field.validity.typeMismatch ? 'Enter a valid email address.' : '';
    }
    if (fieldName === 'phone') {
      var digitCount = value.replace(/\D/g, '').length;
      return digitCount >= 7 && digitCount <= 15
        ? ''
        : 'Enter a phone number. Outside the US, start with + and your country code.';
    }
    if (fieldName === 'type') return value ? '' : 'Choose a session type.';
    return '';
  }

  function validateField(fieldName) {
    var message = getFieldError(fieldName);
    showFieldError(fieldName, message);
    return !message;
  }

  Object.keys(validationFields).forEach(function (fieldName) {
    var field = validationFields[fieldName];
    field.addEventListener('focus', function () { touchedFields[fieldName] = true; });
    field.addEventListener('input', function () {
      if (fieldName === 'phone') field.value = cleanPhone(field.value);
      showFieldError(fieldName, '');
    });
    field.addEventListener('blur', function () {
      if (touchedFields[fieldName]) validateField(fieldName);
    });
  });

  function validateAllFields() {
    var allValid = true;
    Object.keys(validationFields).forEach(function (fieldName) {
      touchedFields[fieldName] = true;
      if (!validateField(fieldName)) allValid = false;
    });
    return allValid;
  }

  var thanks = 'Thank you. Your inquiry has been sent to AD Photography. I’ll be in touch soon.';

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    result.className = 'result';
    resultMessage.textContent = '';

    if (!validateAllFields()) {
      var firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var payload = {};
    new FormData(form).forEach(function (value, key) { payload[key] = value; });

    // Spam trap ticked: a bot filled the hidden box. Show success, send nothing.
    if (payload.botcheck) {
      form.reset();
      result.className = 'result is-visible is-success';
      resultMessage.textContent = thanks;
      return;
    }
    delete payload.botcheck;
    payload.access_key = 'c3856210-3ed1-4ade-b85e-760f4983ca19';
    payload.subject = 'New booking inquiry from AD Photography website';

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok || body.success === false) throw new Error('Submission failed');
        return body;
      });
    }).then(function () {
      form.reset();
      touchedFields = {};
      Object.keys(validationFields).forEach(function (fieldName) { showFieldError(fieldName, ''); });
      result.className = 'result is-visible is-success';
      resultMessage.textContent = thanks;
      result.focus();
    }).catch(function () {
      result.className = 'result is-visible is-error';
      resultMessage.textContent = 'Your inquiry could not be sent. Please check your connection and try again. Your details are still here.';
      result.focus();
    }).finally(function () {
      submitButton.disabled = false;
      submitButton.textContent = 'Send inquiry';
    });
  });
})();
