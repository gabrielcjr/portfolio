/**
 * Gabriel Carneiro Jr. — Portfolio Web Application
 * Main Application Entry Point
 */

import { projectDetails } from './js/data/projects-data.js';
import { initNavbar, initSmoothScroll } from './js/modules/navigation.js';
import { initSkillsFilter } from './js/modules/skills-filter.js';
import {
  openModal,
  closeModal,
  closeAllModals,
  restorePageScroll,
  openProjectModal,
  initModals
} from './js/modules/modal.js';
import {
  copyText,
  showToast,
  handleContactSubmit,
  initContact
} from './js/modules/contact.js';

// Application Controller
const app = {
  projectDetails,
  initNavbar,
  initSmoothScroll,
  initSkillsFilter,
  initModals,
  openModal,
  closeModal,
  closeAllModals,
  restorePageScroll,
  openProjectModal,
  copyText,
  showToast,
  handleContactSubmit,
  initContact,

  init: function () {
    this.initNavbar();
    this.initSkillsFilter();
    this.initModals();
    this.initSmoothScroll();
    this.initContact();
  }
};

// Expose globally to window for HTML inline event handlers
window.app = app;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

export default app;
