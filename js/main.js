// Main entry point for QualiTact application

import { parseRDFData } from './modules/dataProcessing.js';
import { initializeUI } from './modules/uiHandlers.js';

// Parse RDF data and initialize UI when done
parseRDFData(initializeUI);
