// Main entry point for QualiTact application

import { parseRDFData } from './modules/dataProcessing.js';
import { initializeUI } from './modules/uiHandlers.js';

// Wait for all external libraries to be loaded
function initialize() {
  if (typeof $ === 'undefined' || typeof $.fn.jstree === 'undefined') {
    console.warn('External libraries not yet loaded, retrying...');
    setTimeout(initialize, 50);
    return;
  }
  
  console.log('All libraries loaded, initializing application...');
  parseRDFData(initializeUI);
}

// Start initialization
initialize();
