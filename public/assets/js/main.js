// JuraCode – skrypty strony (menu mobilne, rok w stopce, formularz Web3Forms).
// Ładowany z atrybutem defer, więc DOM jest już gotowy.

initNav();
initYear();
initContactForm();

function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (!header || !toggle) return;

  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  header.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function initYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = year;
  });
}

const FORM_MESSAGES = {
  pl: {
    notConfigured: 'Formularz nie jest jeszcze skonfigurowany. Napisz do nas bezpośrednio: kontakt@juracode.pl',
    sending: 'Wysyłanie wiadomości…',
    success: 'Dziękujemy! Wiadomość została wysłana – odezwiemy się najszybciej, jak to możliwe.',
    error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz bezpośrednio na kontakt@juracode.pl.',
  },
  en: {
    notConfigured: 'The form is not configured yet. Please email us directly: kontakt@juracode.pl',
    sending: 'Sending your message…',
    success: 'Thank you! Your message has been sent – we will get back to you as soon as possible.',
    error: 'Your message could not be sent. Please try again or email us directly at kontakt@juracode.pl.',
  },
};

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'pl';
  const t = FORM_MESSAGES[lang];

  const setStatus = (type, message) => {
    status.className = `form-status is-${type}`;
    status.textContent = message;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form));
    if (!data.access_key || data.access_key.includes('{{')) {
      setStatus('error', t.notConfigured);
      return;
    }
    data.subject = `juracode.pl [${lang.toUpperCase()}] – ${data.topic}: ${data.name}`;

    button.disabled = true;
    setStatus('pending', t.sending);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || response.statusText);

      form.reset();
      setStatus('success', t.success);
    } catch (error) {
      console.error('Web3Forms:', error);
      setStatus('error', t.error);
    } finally {
      button.disabled = false;
    }
  });
}
