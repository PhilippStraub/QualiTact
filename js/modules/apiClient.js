// API client module for fetching data from QualiTact backend

const API_BASE_URL = '/api';

/**
 * Fetches the full semantic model from the backend
 * @returns {Promise<string>} RDF Turtle data as string
 */
export async function fetchFullModel() {
  try {
    const response = await fetch(`${API_BASE_URL}/model`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract TTL string from response
    if (data.response && data.response.model) {
      return data.response.model;
    } else {
      throw new Error('Invalid response format: missing TTL data');
    }
  } catch (error) {
    console.error('Error fetching semantic model:', error);
    throw error;
  }
}

/**
 * Fetches quality attributes list
 * @param {number} minScore - Minimum relevance score (default: 0.06)
 * @returns {Promise<Object>} Quality attributes data
 */
export async function fetchQualityAttributes(minScore = 0.06) {
  try {
    const url = `${API_BASE_URL}/model/quality-attributes?minScore=${minScore}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching quality attributes:', error);
    throw error;
  }
}

/**
 * Fetches tactics list
 * @param {number} minScore - Minimum relevance score (default: 0.2)
 * @returns {Promise<Object>} Tactics data
 */
export async function fetchTactics(minScore = 0.2) {
  try {
    const url = `${API_BASE_URL}/model/tactics?minScore=${minScore}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tactics:', error);
    throw error;
  }
}

/**
 * Fetches a single tactic by ID
 * @param {string} tacticId - Tactic identifier
 * @returns {Promise<Object>} Tactic details
 */
export async function fetchTactic(tacticId) {
  try {
    const response = await fetch(`${API_BASE_URL}/model/tactics/${tacticId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching tactic ${tacticId}:`, error);
    throw error;
  }
}

/**
 * Fetches a single quality attribute by ID
 * @param {string} qaId - Quality attribute identifier
 * @returns {Promise<Object>} Quality attribute details
 */
export async function fetchQualityAttribute(qaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/model/quality-attributes/${qaId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching quality attribute ${qaId}:`, error);
    throw error;
  }
}

/**
 * Checks API health status
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
}
