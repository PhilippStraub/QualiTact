// Main entry point for QualiTact application

import { parseRDFData } from './modules/dataProcessing.js';
import { initializeUI } from './modules/uiHandlers.js';

// Wait for all external libraries to be loaded
async function initialize() {
  if (typeof $ === 'undefined' || typeof $.fn.jstree === 'undefined') {
    console.warn('External libraries not yet loaded, retrying...');
    setTimeout(initialize, 50);
    return;
  }
  
  console.log('All libraries loaded, initializing application...');
  
  // Show loading indicator (if you have one in your UI)
  // document.getElementById('loading')?.classList.add('visible');
  
  try {
    await parseRDFData(initializeUI);
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // You could show an error message to the user here
  }
  
  // Hide loading indicator
  // document.getElementById('loading')?.classList.remove('visible');
}

// Start initialization
initialize();
