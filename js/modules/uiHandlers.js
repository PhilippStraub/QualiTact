// UI initialization and event handlers

import { extractEntities } from './dataProcessing.js';
import { buildQATree, buildTacticTree, isQATreeInitialized, isTacticTreeInitialized } from './treeBuilder.js';
import { updateGraphFromSelection, renderGraph, setEdgeLabelMode } from './graphRenderer.js';
import { exportFilteredJSON, exportFilteredJSONwithCertainty, exportFilteredJSONTacticsOnly } from './exportFunctions.js';

export function initializeUI() {
  // Extract entities from triples
  const { qualityAttributes, tactics } = extractEntities();

  buildQATree(qualityAttributes);
  buildTacticTree(tactics);

  // Event Listener für QA Tree Select All/Clear
  document.getElementById('selectAll').addEventListener('click', () => {
    if (isQATreeInitialized()) {
      $('#tree-QA').jstree(true).check_all();
      updateGraphFromSelection();
    }
  });

  document.getElementById('clearAll').addEventListener('click', () => {
    if (isQATreeInitialized()) {
      $('#tree-QA').jstree(true).uncheck_all();
      updateGraphFromSelection();
    }
  });

  // Event Listener für Tactics Tree Select All/Clear
  document.getElementById('selectAllTactics').addEventListener('click', () => {
    if (isTacticTreeInitialized()) {
      $('#tree-Tactics').jstree(true).check_all();
      updateGraphFromSelection();
    }
  });

  document.getElementById('clearAllTactics').addEventListener('click', () => {
    if (isTacticTreeInitialized()) {
      $('#tree-Tactics').jstree(true).uncheck_all();
      updateGraphFromSelection();
    }
  });

  document.getElementById('correlationSlider').addEventListener('input', e => {
    document.getElementById('correlationInput').value = e.target.value;
    updateGraphFromSelection();
  });

  document.getElementById('correlationInput').addEventListener('input', e => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      document.getElementById('correlationSlider').value = value;
      updateGraphFromSelection();
    }
  });

  document.getElementById('certaintySlider').addEventListener('input', e => {
    document.getElementById('certaintyInput').value = e.target.value;
    updateGraphFromSelection();
  });

  document.getElementById('certaintyInput').addEventListener('input', e => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      document.getElementById('certaintySlider').value = value;
      updateGraphFromSelection();
    }
  });

  document.getElementById('correlationTacticSlider').addEventListener('input', e => {
    document.getElementById('correlationTacticsInput').value = e.target.value;
    updateGraphFromSelection();
  });

  document.getElementById('correlationTacticsInput').addEventListener('input', e => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      document.getElementById('correlationTacticSlider').value = value;
      updateGraphFromSelection();
    }
  });

  document.getElementById('showPositive').addEventListener('change', updateGraphFromSelection);
  document.getElementById('showNegative').addEventListener('change', updateGraphFromSelection);

  document.getElementById('selectAllEdges').addEventListener('click', () => {
    setEdgeLabelMode('all');
    updateGraphFromSelection();
  });

  document.getElementById('selectCorrelation').addEventListener('click', () => {
    setEdgeLabelMode('correlation');
    updateGraphFromSelection();
  });

  document.getElementById('selectName').addEventListener('click', () => {
    setEdgeLabelMode('name');
    updateGraphFromSelection();
  });

  document.getElementById('selectEmpty').addEventListener('click', () => {
    setEdgeLabelMode('none');
    updateGraphFromSelection();
  });

  // Export Buttons
  document.getElementById('exportJson').addEventListener('click', exportFilteredJSON);
  document.getElementById('exportJSONTacticsOnly').addEventListener('click', exportFilteredJSONTacticsOnly);

  // Initial graph render
  renderGraph([], 0.1, 0.0, 0.1, [], true, true);
}
