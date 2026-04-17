// Data processing module for RDF parsing and triple management

import { turtleStarData } from '../data/turtleStarData.js';
import { fetchFullModel } from './apiClient.js';
import { shorten } from './utilities.js';


export const allTriples = [];
export const normalTriples = [];
export const certaintyMap = new Map();
export const scoreMinusConfMap = new Map();

let initCallback = null;


export async function parseRDFData(callback) {
  initCallback = callback;
  
  // Try to fetch data from backend API
  let rdfData;
  try {
    console.log('Fetching semantic model from backend API...');
    rdfData = await fetchFullModel();
    console.log('Successfully loaded semantic model from backend');
  } catch (error) {
    console.warn('Failed to fetch from backend, falling back to local data:', error);
    rdfData = turtleStarData;
  }
  
  const parser = new N3.Parser({ format: 'Turtle*' });
  
  parser.parse(rdfData, (error, quad, prefixes) => {
    if (quad) {
      // Distinction between rdf star and normal triples
      if (quad.subject.termType === 'Quad') { 
        // rdf star triple
        allTriples.push(quad);
      } else { 
        // normal triple
        normalTriples.push(quad);
      }
    } else if (error) {
      console.error('Error parsing Turtle:', error);
    } else if (initCallback) {
      initCallback();
    }
  });
}

export function buildCertaintyMaps() {
  allTriples.forEach(({ subject, predicate, object }) => {
    if (subject.termType === 'Quad') {
      const from = subject.subject.value;
      const to = subject.object.value;
      const metaProp = predicate.value;
      const metaVal = parseFloat(object.value);
      const key = `${from}|${to}`;

      if (metaProp.endsWith('Confidence')) {
        certaintyMap.set(key, metaVal);
      } else if (metaProp.endsWith('ScoreMinusConf')) {
        scoreMinusConfMap.set(key, metaVal);
      }
    }
  });
}


export function extractEntities() {
  const qualityAttributes = new Set();
  const tactics = new Set();

  allTriples.forEach(({ subject }) => {
    if (subject.termType === 'Quad') {
      const rel = subject.predicate.value;
      if (shorten(rel) === "impacts") {
        qualityAttributes.add(subject.object.value);
        tactics.add(subject.subject.value);
      } else if (shorten(rel) === "affects"){
        tactics.add(subject.object.value);
        tactics.add(subject.subject.value);  
      } else {
        console.log('Error, Unknown Relation: ' + shorten(rel));
      }
    }
  });

  return {
    qualityAttributes: [...qualityAttributes],
    tactics: [...tactics]
  };
}
