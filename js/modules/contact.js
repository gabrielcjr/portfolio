/**
 * Contact & Feedback Module
 * Handles form validation/submission, clipboard copy, and toast feedback.
 */

export function copyText(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Copied to clipboard!');
  }).catch(() => {
    window.prompt('Copy to clipboard:', text);
  });
}

export function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  if (toast && toastMsg) {
    toastMsg.textContent = msg;
    toast.classList.add('active');

    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }
}

export function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.elements['name'].value;
  const email = form.elements['email'].value;
  const subject = form.elements['subject'] ? form.elements['subject'].value : 'Engineering Collaboration';
  const message = form.elements['message'].value;

  const mailtoUrl = `mailto:gabrielcjr4@gmail.com?subject=${encodeURIComponent(subject + ' — from ' + name)}&body=${encodeURIComponent(message + '\n\nSender: ' + name + ' (' + email + ')')}`;
  window.location.href = mailtoUrl;

  showToast('Opening your email client to send message...');
  form.reset();
}

export function initContact() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
}
