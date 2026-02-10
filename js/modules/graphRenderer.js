// Graph rendering module using vis

import { allTriples, normalTriples, certaintyMap, scoreMinusConfMap, buildCertaintyMaps } from './dataProcessing.js';
import { shorten, showLoading, hideLoading, updateLoadingProgress } from './utilities.js';
import { isQATreeInitialized, isTacticTreeInitialized } from './treeBuilder.js';


export let edgeLabelMode = 'all';

export function setEdgeLabelMode(mode) {
  edgeLabelMode = mode;
}

export function updateGraphFromSelection() {
  const selectedAttributes = isQATreeInitialized() ? $('#tree-QA').jstree('get_checked') : [];
  const selectedTactics = isTacticTreeInitialized() ? $('#tree-Tactics').jstree('get_checked') : [];
  const threshold = parseFloat(document.getElementById('correlationSlider').value);
  const certaintyThreshold = parseFloat(document.getElementById('certaintySlider').value);
  const tacticCorrelationThreshold = parseFloat(document.getElementById('correlationTacticSlider').value);
  const showPositive = document.getElementById('showPositive').checked;
  const showNegative = document.getElementById('showNegative').checked;
  
  if (threshold < 0.2 || tacticCorrelationThreshold < 0.2) {
    showLoading('Filter werden angewendet...');
  }
  
  setTimeout(() => {
    renderGraph(selectedAttributes, threshold, certaintyThreshold, tacticCorrelationThreshold, selectedTactics, showPositive, showNegative);
  }, 10);
}

export function renderGraph(selectedAttributes, minCorrelation, minCertainty, tacticCorrelationThreshold, selectedTactics, showPositive, showNegative) {
  const nodes = new Map();
  const edges = [];
  const tacticSet = new Set();
  const qualitySet = new Set();

  buildCertaintyMaps();

  // identify relevant tactics based on selected QAs
  const relevantTactics = new Set();
  if (selectedAttributes.length > 0) {
    allTriples.forEach(({ subject, predicate, object }) => {
      if (subject.termType === 'Quad') {
        const from = subject.subject.value;
        const rel = subject.predicate.value;
        const to = subject.object.value;
        const metaVal = parseFloat(object.value);
        const metaProp = predicate.value; 
        
        if (shorten(rel) === "impacts" && selectedAttributes.includes(to) && metaProp.endsWith('Score')) { 
          if(Math.abs(metaVal) >= minCorrelation){
            relevantTactics.add(from);
          }
        }
      }
    });
  }

  // create edges
  allTriples.forEach(({ subject, predicate, object }) => {
    if (subject.termType === 'Quad') {
      const from = subject.subject.value;
      const rel = subject.predicate.value; // http://example.org/affects
      const to = subject.object.value;
      const metaProp = predicate.value;    // http://example.org/Score
      const metaVal = parseFloat(object.value);

      // only process scores
      if (!metaProp.endsWith('Score')) return;

      const certaintyKey = `${from}|${to}`;
      const certaintyVal = certaintyMap.get(certaintyKey);
      const scoreMinusConfVal = scoreMinusConfMap.get(certaintyKey);

      // filters
      if (certaintyVal !== undefined && certaintyVal < minCertainty) return;

      if (certaintyVal === undefined) return;

      if (selectedAttributes.length > 0) {
        const isAffects = shorten(rel) === "affects";
        const isImpacts = shorten(rel) === "impacts";

        if (isImpacts && !selectedAttributes.includes(to)) {
          return; // Taktik -> QA: Nur anzeigen, wenn QA ausgewählt ist
        }
        
        if (isAffects && (!relevantTactics.has(from) || !relevantTactics.has(to))) {
          return; // Taktik -> Taktik: Nur anzeigen, wenn beide Taktiken relevant sind
        } 
      }
      if (selectedTactics.length > 0 && !selectedTactics.includes(from)) return;

      if (Math.abs(metaVal) < tacticCorrelationThreshold && shorten(rel) === "affects") return;
      if (Math.abs(metaVal) < minCorrelation && shorten(rel) === "impacts") return;

      if (showPositive && !showNegative && metaVal < 0) return;
      if (showNegative && !showPositive && metaVal > 0) return;

      var tacticTypeTripleFrom = null;
      var tacticTypeTripleTo = null;

      // Define nodes and edges
      if (shorten(rel) === "affects") {
        tacticTypeTripleFrom = normalTriples.find(t => t.subject.value === from && t.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        tacticTypeTripleTo = normalTriples.find(t => t.subject.value === to && t.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
      } else if (shorten(rel) === "impacts"){
        tacticTypeTripleFrom = normalTriples.find(t => t.subject.value === from && t.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
      } else {
        console.log('Error, Relation not known: ' + shorten(rel)) 
      }

      if (tacticTypeTripleTo != null) {
        if (shorten(tacticTypeTripleTo.object.value) === 'Tactic') {
          nodes.set(to, { id: to, label: shorten(to), shape: 'hexagon', title: `http://example.org/${shorten(to)}` });
        }
      } else {
        nodes.set(to, { id: to, label: shorten(to), color: '#ffc107' });
      }
      if(tacticTypeTripleFrom != null){
        if (shorten(tacticTypeTripleFrom.object.value) === 'Tactic') {
          nodes.set(from, { id: from, label: shorten(from), shape: 'hexagon', title: `http://example.org/${shorten(from)}` });
        }
      }

      const edgeLength = 400 - (Math.abs(metaVal) * 300);

      let edgeLabel = '';
      let edgeTitle = '';

      switch (edgeLabelMode) {
        case 'correlation':
          edgeLabel = metaVal.toFixed(2);
          break;
        case 'certainty':
          edgeLabel = certaintyVal !== undefined ? `${certaintyVal}%` : '';
          break;
        case 'name':
          edgeLabel = shorten(rel);
          break;
        case 'none':
          edgeLabel = '';
          break;
        default: // 'all'
          edgeLabel = metaVal.toFixed(2);
          if (certaintyVal !== undefined && scoreMinusConfVal !== undefined) {
            edgeLabel += ` (${certaintyVal.toFixed(2)} x ${scoreMinusConfVal.toFixed(2)})`;
          } else if (certaintyVal !== undefined) {
            edgeLabel += ` (${certaintyVal.toFixed(2)})`;
          }
          break;
      }

      edgeTitle = `Score: ${metaVal.toFixed(4)}` +
                  (certaintyVal !== undefined ? ` = Confidence: ${certaintyVal.toFixed(4)}` : '') +
                  (scoreMinusConfVal !== undefined ? ` x ScoreMinusConf: ${scoreMinusConfVal.toFixed(4)}` : '');

      let arrowsStyle = "to";
      edges.push({
        from: from,
        to: to,
        label: edgeLabel,
        title: edgeTitle,
        color: { color: metaVal > 0 ? '#0077cc' : '#cc0000' },
        arrows: arrowsStyle,
        font: { align: 'middle', size: 14 },
        length: edgeLength,
      });
      
      if (shorten(rel) === "affects") {
          tacticSet.add(from);
          tacticSet.add(to);
      } else {
          tacticSet.add(from);
          qualitySet.add(to);
      }
    }
  });

  const container = document.getElementById('network');
  const data = { nodes: Array.from(nodes.values()), edges };
  const options = {
    layout: { improvedLayout: false },
    physics: {
      solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -60 },
      stabilization: { iterations: 1000 }
    },
    edges: { smooth: true },
    nodes: { shape: 'dot', size: 20, font: { size: 14 } }
  };

  showLoading('Initialising network...');

  const network = new vis.Network(container, data, options);

  network.on('stabilizationProgress', function(params) {
    const progress = Math.round((params.iterations / params.total) * 100);
    updateLoadingProgress(progress, `Stabilization: ${params.iterations}/${params.total} iterations`);
  });
  
  network.on('stabilizationIterationsDone', function() {
    updateLoadingProgress(100, 'Rendering finished...');
  });
  
  network.on('stabilized', function() {
    setTimeout(hideLoading, 300);
  });
  
  document.getElementById('stats_subject').innerText = tacticSet.size;
  document.getElementById('stats_object').innerText = qualitySet.size;
  document.getElementById('stats_tactics').innerText = $('#tree-Tactics').jstree('get_checked').length;
  document.getElementById('stats_qa').innerText = $('#tree-QA').jstree('get_checked').length;
}
