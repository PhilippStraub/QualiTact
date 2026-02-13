// Main entry point for QualiTact application

import { parseRDFData } from './modules/dataProcessing.js';
import { initializeUI } from './modules/uiHandlers.js';


function initialize() {
  if (typeof $ === 'undefined' || typeof $.fn.jstree === 'undefined') {
    console.warn('External libraries not yet loaded, retrying...');
    setTimeout(initialize, 50);
    return;
  }
  parseRDFData(initializeUI);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
