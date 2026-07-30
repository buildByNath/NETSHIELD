import axios from 'axios';

/**
 * File: api.js
 * Author: Antigravity AI
 * Purpose: Axios API service declarations for communicating with FastAPI backend.
 */

const API_BASE_URL = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const templateService = {
  getTemplates: async () => {
    const response = await client.get('/templates');
    return response.data;
  },
  loadTemplate: async (templateId) => {
    const response = await client.post('/template/load', { template: templateId });
    return response.data;
  },
};

export const algorithmService = {
  getAlgorithms: async () => {
    const response = await client.get('/algorithms');
    return response.data;
  },
  simulateAttack: async (algoId, nodes, edges, startNodes) => {
    const formattedNodes = nodes.map(node => ({
      id: node.id,
      label: node.data?.label || node.id,
      type: node.type || 'PC',
      status: node.data?.status || 'healthy',
      position: {
        x: node.position.x,
        y: node.position.y
      }
    }));

    const formattedEdges = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      weight: parseFloat(edge.data?.weight ?? 1.0),
      latency: parseFloat(edge.data?.latency ?? 10.0),
      bandwidth: parseFloat(edge.data?.bandwidth ?? 100.0)
    }));

    const response = await client.post('/simulate', {
      algorithm: algoId,
      graph: {
        nodes: formattedNodes,
        edges: formattedEdges
      },
      startNodes
    });
    return response.data;
  },
  recoverNetwork: async (algoId, nodes, edges, options = {}) => {
    const formattedNodes = nodes.map(node => ({
      id: node.id,
      label: node.data?.label || node.id,
      type: node.type || 'PC',
      status: node.data?.status || 'healthy',
      position: {
        x: node.position.x,
        y: node.position.y
      }
    }));

    const formattedEdges = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      weight: parseFloat(edge.data?.weight ?? 1.0),
      latency: parseFloat(edge.data?.latency ?? 10.0),
      bandwidth: parseFloat(edge.data?.bandwidth ?? 100.0)
    }));

    const response = await client.post('/recover', {
      algorithm: algoId,
      graph: {
        nodes: formattedNodes,
        edges: formattedEdges
      },
      options
    });
    return response.data;
  },
  simulateSort: async (algoId, array) => {
    const response = await client.post('/simulate/sort', {
      algorithm: algoId,
      options: { array }
    });
    return response.data;
  },
  simulateDP: async (dimensions) => {
    const response = await client.post('/simulate/dp', {
      options: { dimensions }
    });
    return response.data;
  },
  simulateStrassen: async (A, B) => {
    const response = await client.post('/simulate/strassen', {
      options: { A, B }
    });
    return response.data;
  },
  simulateNQueens: async (N) => {
    const response = await client.post('/simulate/nqueens', {
      options: { N }
    });
    return response.data;
  },
};


export const validationService = {
  validateGraph: async (nodes, edges) => {
    // Format nodes and edges to match expected Pydantic schema
    const formattedNodes = nodes.map(node => ({
      id: node.id,
      label: node.data?.label || node.id,
      type: node.type || 'PC',
      status: node.data?.status || 'healthy',
      position: {
        x: node.position.x,
        y: node.position.y
      }
    }));

    const formattedEdges = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      weight: parseFloat(edge.data?.weight ?? 1.0),
      latency: parseFloat(edge.data?.latency ?? 10.0),
      bandwidth: parseFloat(edge.data?.bandwidth ?? 100.0)
    }));

    const response = await client.post('/validate', {
      nodes: formattedNodes,
      edges: formattedEdges
    });
    return response.data;
  },
};

export const projectService = {
  saveProject: async (projectState) => {
    const response = await client.post('/save', projectState);
    return response.data;
  },
  loadProject: async () => {
    const response = await client.post('/load');
    return response.data;
  },
};



export default client;
