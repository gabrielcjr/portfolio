/**
 * Modal Management Module
 * Controls opening/closing modals, keyboard accessibility, scroll lock/restoration,
 * and dynamic project deep-dive modal rendering.
 */

import { projectDetails } from '../data/projects-data.js';

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = modalId ? document.getElementById(modalId) : null;
  if (modal) {
    modal.classList.remove('active');
  }

  // Check if any modal is still active
  const anyActive = document.querySelector('.modal-overlay.active');
  if (!anyActive) {
    restorePageScroll();
  }
}

export function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => {
    m.classList.remove('active');
  });
  restorePageScroll();
}

export function restorePageScroll() {
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';

  // Unfocus any active element to ensure mouse scroll targets the window
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
}

export function openProjectModal(projectId) {
  const data = projectDetails[projectId];
  if (!data) return;

  const titleElem = document.getElementById('modal-project-title');
  const bodyElem = document.getElementById('modal-project-body');

  titleElem.textContent = data.title;

  const badgesHtml = data.badges.map(b => `<span class="tag-badge highlight">${b}</span>`).join(' ');

  const challengesHtml = data.challengesSolved.map(c => `
    <div style="margin-bottom: 0.85rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
      <strong style="color: #818cf8; display: block; margin-bottom: 0.25rem;">${c.title}</strong>
      <span style="font-size: 0.875rem; color: #94a3b8; line-height: 1.5;">${c.detail}</span>
    </div>
  `).join('');

  const liveBtnHtml = data.liveUrl ? `
    <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald btn-sm">
      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </svg>
      <span>Launch Live Application</span>
    </a>
  ` : '';

  bodyElem.innerHTML = `
    <div class="modal-deepdive-grid">
      <div>
        <p style="font-size: 1rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 1.25rem;">
          ${data.overview}
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
          ${badgesHtml}
        </div>
      </div>

      <div>
        <h4 class="modal-section-title">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <span>System Architecture & Data Pipeline</span>
        </h4>
        <pre class="modal-code-block"><code>${data.architectureFlow.trim()}</code></pre>
      </div>

      <div>
        <h4 class="modal-section-title">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <span>Key Technical Challenges & Solutions</span>
        </h4>
        ${challengesHtml}
      </div>

      <div>
        <h4 class="modal-section-title">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
          <span>Core Implementation Code Pattern</span>
        </h4>
        <pre class="modal-code-block"><code>${data.codeSnippet}</code></pre>
      </div>

      <div style="display: flex; gap: 0.75rem; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap;">
        ${liveBtnHtml}
        <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
          </svg>
          <span>View Source on GitHub</span>
        </a>
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.closeModal('project-modal')" style="margin-left: auto;">
          <span>Close</span>
        </button>
      </div>
    </div>
  `;

  openModal('project-modal');
}

export function initModals() {
  const openResumeBtn = document.getElementById('open-resume-btn');
  const heroResumeBtn = document.getElementById('hero-view-cv-btn');
  const mobileResumeBtn = document.getElementById('mobile-resume-btn');

  const openResume = () => openModal('resume-modal');

  if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
  if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResume);
  if (mobileResumeBtn) mobileResumeBtn.addEventListener('click', openResume);

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Close modal on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });
}
