// Export functions module for filtered JSON data exports

import { allTriples, normalTriples, certaintyMap } from './dataProcessing.js';
import { shorten } from './utilities.js';
import { tacticDefinitions, tacticDefinitionsReferences } from '../data/tacticData.js';


export function exportFilteredJSON() {
  const selectedAttributes = $('#tree-QA').jstree('get_checked');
  const selectedTactics = $('#tree-Tactics').jstree('get_checked');
  const minCorrelation = parseFloat(document.getElementById('correlationSlider').value);
  const minCertainty = parseFloat(document.getElementById('certaintySlider').value);
  const tacticCorrelationThreshold = parseFloat(document.getElementById('correlationTacticSlider').value);
  const showPositive = document.getElementById('showPositive').checked;
  const showNegative = document.getElementById('showNegative').checked;
  const includeTacticRelations = document.getElementById('includeTacticRelations').checked;

  // Collect all filtered tactics
  const tacticSet = new Set();
  
  allTriples.forEach(({ subject, predicate, object }) => {
    if (subject.termType === 'Quad') {
      const tactic = subject.subject.value;
      const qualityAttr = subject.object.value;
      const metaProp = predicate.value;
      const metaVal = parseFloat(object.value);

      // only process scores of the model
      if (!metaProp.endsWith('Score')) return;

      if (selectedAttributes.length > 0 && !selectedAttributes.includes(qualityAttr)) return;
      if (selectedTactics.length > 0 && !selectedTactics.includes(tactic)) return;
      if (predicate.value.endsWith('Confidence')) return;

      // filter application
      if (Math.abs(metaVal) < tacticCorrelationThreshold && shorten(subject.predicate.value) === "impacts") return;
      if (Math.abs(metaVal) < minCorrelation && shorten(subject.predicate.value) === "affects") return;

      // only positive?
      if (showPositive && !showNegative && metaVal < 0) return;

      // only negaitve?
      if (showNegative && !showPositive && metaVal > 0) return;

      // certainty filter
      const key = `${tactic}|${qualityAttr}`;
      const certaintyVal = certaintyMap.get(key);
      if (certaintyVal === undefined || certaintyVal < minCertainty) return;

      tacticSet.add(tactic);
    }
  });

  // Hilfsfunktion: Erstellt ein Taktik-Objekt mit allen relevanten Eigenschaften
  function createTacticObject(tacticIri, includeScore = false, scoreValue = null) {
    const typeTriple = normalTriples.find(t =>
      t.subject.value === tacticIri &&
      t.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    );
    const typeShort = typeTriple ? shorten(typeTriple.object.value) : null;
    const tacticShortName = shorten(tacticIri);
    
    const tacticObj = {
      Tactic: tacticShortName,
      Type: typeShort
    };

    if (includeScore && scoreValue !== null) {
      tacticObj.Score = +scoreValue.toFixed(4);
    }

    // Definition hinzufügen, falls vorhanden
    if (tacticDefinitions[tacticShortName]) {
      tacticObj.Definition = tacticDefinitions[tacticShortName];
      if(tacticDefinitionsReferences[tacticShortName]) {
        tacticObj.DefinitionReferences = 'Paper Reference-IDs: ' + tacticDefinitionsReferences[tacticShortName]+ ' (for DOI, check https://github.com/PhilippStraub/QualiTact/references.xlsx)';
      }
    }

    return tacticObj;
  }

  // Hilfsfunktion: Findet alle Taktiken, die von einer gegebenen Taktik beeinflusst werden (impacts)
  function findImpacts(tacticIri) {
    const impacts = [];
    const seen = new Set();
    
    allTriples.forEach(({ subject, predicate, object }) => {
      if (subject.termType === 'Quad' && 
          shorten(subject.predicate.value) === "impacts" &&
          subject.subject.value === tacticIri &&
          predicate.value.endsWith('Score')) {
        
        const metaVal = parseFloat(object.value);
        
        // Nur hinzufügen, wenn der Score-Wert über dem Schwellenwert liegt
        // UND die Zieltaktik auch im gefilterten tacticSet enthalten ist
        if (Math.abs(metaVal) >= tacticCorrelationThreshold) {
          const targetTactic = subject.object.value;
          if (tacticSet.has(targetTactic) && !seen.has(targetTactic)) {
            impacts.push({ tacticIri: targetTactic, score: metaVal });
            seen.add(targetTactic);
          }
        }
      }
    });
    
    return impacts;
  }

  // Hilfsfunktion: Findet alle Taktiken, die eine gegebene Taktik beeinflussen (impactedBy)
  function findImpactedBy(tacticIri) {
    const impactedBy = [];
    const seen = new Set();
    
    allTriples.forEach(({ subject, predicate, object }) => {
      if (subject.termType === 'Quad' && 
          shorten(subject.predicate.value) === "impacts" &&
          subject.object.value === tacticIri &&
          predicate.value.endsWith('Score')) {
        
        const metaVal = parseFloat(object.value);
        
        // Nur hinzufügen, wenn der Score-Wert über dem Schwellenwert liegt
        // UND die Quelltaktik auch im gefilterten tacticSet enthalten ist
        if (Math.abs(metaVal) >= tacticCorrelationThreshold) {
          const sourceTactic = subject.subject.value;
          if (tacticSet.has(sourceTactic) && !seen.has(sourceTactic)) {
            impactedBy.push({ tacticIri: sourceTactic, score: metaVal });
            seen.add(sourceTactic);
          }
        }
      }
    });
    
    return impactedBy;
  }

  const result = { Scores: {} };

  allTriples.forEach(({ subject, predicate, object }) => {
    if (subject.termType === 'Quad') {
      // Nur CorrelationValue-Triple verarbeiten
      if (predicate.value !== 'http://example.org/Score') return;

      const tactic = subject.subject.value;
      const qualityAttr = subject.object.value;
      const correlation = parseFloat(object.value);

      if (selectedAttributes.length > 0 && !selectedAttributes.includes(qualityAttr)) return;
      if (selectedTactics.length > 0 && !selectedTactics.includes(tactic)) return;
      //Abbruch, wenn Certainty Triple
      if (predicate.value.endsWith('Confidence')) return;

      //Filter für Correlation Tactic
      if (Math.abs(correlation) < tacticCorrelationThreshold && shorten(subject.predicate.value) === "impacts") return;
      if (Math.abs(correlation) < minCorrelation && shorten(subject.predicate.value) === "affects") return;
      
      //Filter für nur positive Werte für Score
      if (showPositive && !showNegative && correlation < 0) return;

      //Filter für nur negative Werte für Score
      if (showNegative && !showPositive && correlation > 0) return;
      
      // Certainty aus globaler Map abrufen und Filter anwenden
      const certaintyKey = `${tactic}|${qualityAttr}`;
      const certaintyVal = certaintyMap.get(certaintyKey);
      if (certaintyVal === undefined || certaintyVal < minCertainty) return;

      const qaKey = shorten(qualityAttr);
      if (!result.Scores[qaKey]) {
        result.Scores[qaKey] = { Tactics: [] };
      }

      // Prüfen, ob diese Taktik bereits für das QA existiert
      const exists = result.Scores[qaKey].Tactics.some(
        t => t.Tactic === shorten(tactic)
      );
      if (!exists) {
        const tacticObj = createTacticObject(tactic, true, correlation);
        
        // Impacts und ImpactedBy nur hinzufügen, wenn Checkbox aktiviert ist
        if (includeTacticRelations) {
          // Impacts hinzufügen
          const impactTactics = findImpacts(tactic);
          if (impactTactics.length > 0) {
            tacticObj.Impacts = impactTactics.map(t => createTacticObject(t.tacticIri, true, t.score));
          }
          
          // ImpactedBy hinzufügen
          const impactedByTactics = findImpactedBy(tactic);
          if (impactedByTactics.length > 0) {
            tacticObj.ImpactedBy = impactedByTactics.map(t => createTacticObject(t.tacticIri, true, t.score));
          }
        }

        result.Scores[qaKey].Tactics.push(tacticObj);
      }
    }
  });

  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'filtered_scores.json';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports filtered JSON with correlations including certainty values
 * Separates QA-Tactic correlations from Tactic-Tactic correlations
 */
export function exportFilteredJSONwithCertainty() {
  const selectedAttributes = $('#tree-QA').jstree('get_checked') || [];
  const selectedTactics = $('#tree-Tactics').jstree('get_checked') || [];
  const minCorrelation = parseFloat(document.getElementById('correlationSlider').value);
  const minCertainty = parseFloat(document.getElementById('certaintySlider').value);
  const tacticCorrelationThreshold = parseFloat(document.getElementById('correlationTacticSlider').value);
  const showPositive = document.getElementById('showPositive').checked;
  const showNegative = document.getElementById('showNegative').checked;

  const result = { Correlations: { QualityAttributesAndTactics: {}, TacticsOnly: {} } };

  allTriples.forEach(({ subject, predicate, object }) => {
    if (subject.termType === 'Quad') {
      const tactic = subject.subject.value;
      const qualityAttr = subject.object.value;
      const correlation = parseFloat(object.value);
      const certaintyOrCorrelation = shorten(subject.predicate.value);
      const metaVal = parseFloat(object.value);

      // Filter nach Auswahl und minimaler Korrelation
      if (selectedAttributes.length > 0 && !selectedAttributes.includes(qualityAttr)) return;
      if (selectedTactics.length > 0 && !selectedTactics.includes(tactic)) return;
      if (Math.abs(correlation) < minCorrelation) return;
      // Abbruch, wenn Certainty-Triple
      if (predicate.value.endsWith('Confidence')) return;

      // Spezifische Filter
      if (certaintyOrCorrelation === "impacts" && Math.abs(correlation) < tacticCorrelationThreshold) return;
      if (certaintyOrCorrelation === "affects" && Math.abs(correlation) < minCorrelation) return;
      
      //Filter für nur positive Werte für Score
      if (showPositive && !showNegative && metaVal < 0) return;

      //Filter für nur negative Werte für Score
      if (showNegative && !showPositive && metaVal > 0) return;

      // Certainty aus globaler Map abrufen und Filter anwenden
      const certaintyKey = `${tactic}|${qualityAttr}`;
      const certaintyVal = certaintyMap.get(certaintyKey);
      if (certaintyVal === undefined || certaintyVal < minCertainty) return;

      const qaKey = shorten(qualityAttr);
      const tacticKey = shorten(tactic);

      if (certaintyOrCorrelation === "affects") {
        // Ablage unter Correlations.QualityAttributesAndTactics
        if (!result.Correlations.QualityAttributesAndTactics[qaKey]) {
          result.Correlations.QualityAttributesAndTactics[qaKey] = { Tactics: [] };
        }
        const exists = result.Correlations.QualityAttributesAndTactics[qaKey].Tactics.some(
          t => t.Tactic === tacticKey
        );
        if (!exists) {
          result.Correlations.QualityAttributesAndTactics[qaKey].Tactics.push({
            Tactic: tacticKey,
            Correlation: +correlation.toFixed(4),
            Certainty: +certaintyVal.toFixed(2)
          });
        }
      } else if (certaintyOrCorrelation === "impacts") {
        // Ablage unter Correlations.TacticsOnly
        if (!result.Correlations.TacticsOnly[tacticKey]) {
          result.Correlations.TacticsOnly[tacticKey] = [];
        }
        const exists = result.Correlations.TacticsOnly[tacticKey].some(
          qa => qa.QualityAttribute === qaKey
        );
        if (!exists) {
          result.Correlations.TacticsOnly[tacticKey].push({
            QualityAttribute: qaKey,
            Correlation: +correlation.toFixed(4),
            Certainty: +certaintyVal.toFixed(2)
          });
        }
      }
    }
  });

  // JSON-Datei erzeugen und downloaden
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'filtered_correlations.json';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports filtered JSON with tactics only (no quality attributes in main structure)
 * Includes optional tactic-to-tactic relationships (impacts/impactedBy)
 */
export function exportFilteredJSONTacticsOnly() {
  const selectedAttributes = $('#tree-QA').jstree('get_checked') || [];
  const selectedTactics = $('#tree-Tactics').jstree('get_checked') || [];
  const minCorrelation = parseFloat(document.getElementById('correlationSlider').value);
  const minCertainty = parseFloat(document.getElementById('certaintySlider').value);
  const tacticCorrelationThreshold = parseFloat(document.getElementById('correlationTacticSlider').value);
  const showPositive = document.getElementById('showPositive').checked;
  const showNegative = document.getElementById('showNegative').checked;
  const includeTacticRelations = document.getElementById('includeTacticRelations').checked;
  const tacticSet = new Set();

  allTriples.forEach(({ subject, predicate, object }) => {
    if (subject.termType === 'Quad') {
      const tactic = subject.subject.value;
      const qualityAttr = subject.object.value;
      const metaProp = predicate.value;
      const metaVal = parseFloat(object.value);

      // Nur CorrelationValues weiterverarbeiten
      if (!metaProp.endsWith('Score')) return;

      if (selectedAttributes.length > 0 && !selectedAttributes.includes(qualityAttr)) return;
      if (selectedTactics.length > 0 && !selectedTactics.includes(tactic)) return;
      //Abbruch, wenn Certainty Triple
      if (predicate.value.endsWith('Confidence')) return;

      // Filter für Correlation Tactic
      if (Math.abs(metaVal) < tacticCorrelationThreshold && shorten(subject.predicate.value) === "impacts") return;
      if (Math.abs(metaVal) < minCorrelation && shorten(subject.predicate.value) === "affects") return;

      // Filter für nur positive Werte für Score
      if (showPositive && !showNegative && metaVal < 0) return;

      // Filter für nur negative Werte für Score
      if (showNegative && !showPositive && metaVal > 0) return;

      // Certainty-Filter anwenden
      const key = `${tactic}|${qualityAttr}`;
      const certaintyVal = certaintyMap.get(key);
      if (certaintyVal === undefined || certaintyVal < minCertainty) return;

      // Volle IRI merken, damit wir später den Typ lookupen können
      tacticSet.add(tactic);
    }
  });

  function createTacticObject(tacticIri) {
    const typeTriple = normalTriples.find(t =>
      t.subject.value === tacticIri &&
      t.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    );
    const typeShort = typeTriple ? shorten(typeTriple.object.value) : null;
    const tacticShortName = shorten(tacticIri);
    
    const tacticObj = {
      Tactic: tacticShortName,
      Type: typeShort
    };

    // Add definition if available
    if (tacticDefinitions[tacticShortName]) {
      tacticObj.Definition = tacticDefinitions[tacticShortName];
      if(tacticDefinitionsReferences[tacticShortName]) {
        tacticObj.DefinitionReferences = 'Paper Reference-IDs: ' + tacticDefinitionsReferences[tacticShortName]+ ' (for DOI, check https://github.com/PhilippStraub/QualiTact/references.xlsx)';
      }
    }

    return tacticObj;
  }

  function findImpacts(tacticIri) {
    const impacts = [];
    const seen = new Set();
    
    allTriples.forEach(({ subject, predicate, object }) => {
      if (subject.termType === 'Quad' && 
          shorten(subject.predicate.value) === "impacts" &&
          subject.subject.value === tacticIri &&
          predicate.value.endsWith('Score')) {
        
        const metaVal = parseFloat(object.value);
        
        // Only add if score is above the threshold and target tactic is also included in the filtered tacticSet
        if (Math.abs(metaVal) >= tacticCorrelationThreshold) {
          const targetTactic = subject.object.value;
          if (tacticSet.has(targetTactic) && !seen.has(targetTactic)) {
            impacts.push({ tacticIri: targetTactic, score: metaVal });
            seen.add(targetTactic);
          }
        }
      }
    });
    
    return impacts;
  }

  function findImpactedBy(tacticIri) {
    const impactedBy = [];
    const seen = new Set();
    
    allTriples.forEach(({ subject, predicate, object }) => {
      if (subject.termType === 'Quad' && 
          shorten(subject.predicate.value) === "impacts" &&
          subject.object.value === tacticIri &&
          predicate.value.endsWith('Score')) {
        
        const metaVal = parseFloat(object.value);

        // Only add if score is above the threshold and source tactic is also included in the filtered tacticSet
        if (Math.abs(metaVal) >= tacticCorrelationThreshold) {
          const sourceTactic = subject.subject.value;
          if (tacticSet.has(sourceTactic) && !seen.has(sourceTactic)) {
            impactedBy.push({ tacticIri: sourceTactic, score: metaVal });
            seen.add(sourceTactic);
          }
        }
      }
    });
    
    return impactedBy;
  }

  const result = {
    Tactics: Array.from(tacticSet).map(tacticIri => {
      const tacticObj = createTacticObject(tacticIri);
      
      if (includeTacticRelations) {
        const impactTactics = findImpacts(tacticIri);
        if (impactTactics.length > 0) {
          tacticObj.Impacts = impactTactics.map(t => {
            const obj = createTacticObject(t.tacticIri);
            obj.Score = +t.score.toFixed(4);
            return obj;
          });
        }

        const impactedByTactics = findImpactedBy(tacticIri);
        if (impactedByTactics.length > 0) {
          tacticObj.ImpactedBy = impactedByTactics.map(t => {
            const obj = createTacticObject(t.tacticIri);
            obj.Score = +t.score.toFixed(4);
            return obj;
          });
        }
      }

      return tacticObj;
    })
  };

  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'filtered_tactics.json';
  link.click();
  URL.revokeObjectURL(url);
}
