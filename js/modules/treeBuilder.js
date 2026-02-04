// Tree builder functions for QA and tactic trees

import { shorten } from './utilities.js';
import { updateGraphFromSelection } from './graphRenderer.js';

let qaTreeInitialized = false;
let tacticTreeInitialized = false;

export function isQATreeInitialized() {
  return qaTreeInitialized;
}

export function isTacticTreeInitialized() {
  return tacticTreeInitialized;
}

export function buildQATree(attributes) {
  const data = attributes.sort().map(attr => ({
    id: attr,
    text: shorten(attr),
    icon: "bi bi-circle-fill text-warning"
  }));

  $('#tree-QA').jstree("destroy").empty();

  $('#tree-QA').jstree({
    core: {
      data: data,
      themes: { icons: true }
    },
    types: {
      default: {
        icon: "bi bi-circle-fill text-warning"
      }
    },
    plugins: ["types", "checkbox", "search"],
    checkbox: {
      three_state: false,
      cascade: "up+down"
    },
    search: {
      case_sensitive: false,
      show_only_matches: true
    }
  });

  qaTreeInitialized = true;

  // search
  let to = false;
  $('#treeSearchQA').on("keyup", function () {
    if (to) clearTimeout(to);
    to = setTimeout(() => {
      const v = $('#treeSearchQA').val();
      $('#tree-QA').jstree(true).search(v);
    }, 250);
  });

  // update on change
  $('#tree-QA').on("changed.jstree", function () {
    updateGraphFromSelection();
  });
}

export function buildTacticTree(tactics) {
  const data = tactics.sort().map(tac => {
    return {
      id: tac,
      text: shorten(tac),
      icon: "bi bi-hexagon-fill text-primary"
    };
  });

  $('#tree-Tactics').jstree("destroy").empty();

  $('#tree-Tactics').jstree({
    core: {
      data: data,
      themes: { icons: true }
    },
    types: {
      "default": {
        "icon": "bi bi-hexagon-fill text-primary"
      },
      "design": {
        "icon": "bi bi-diamond-fill text-primary"
      }
    },
    plugins: ["types", "checkbox", "search"],
    checkbox: {
      three_state: false,
      cascade: "up+down"
    },
    search: {
      case_sensitive: false,
      show_only_matches: true
    }
  });

  tacticTreeInitialized = true;

  let to = false;
  $('#treeSearchTactics').on("keyup", function () {
    if (to) clearTimeout(to);
    to = setTimeout(() => {
      const v = $('#treeSearchTactics').val();
      $('#tree-Tactics').jstree(true).search(v);
    }, 250);
  });

  $('#tree-Tactics').on("changed.jstree", function () {
    updateGraphFromSelection();
  });
}
