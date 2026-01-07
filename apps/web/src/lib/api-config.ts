/**
 * API Configuration - External API settings and utilities
 *
 * Configuration for the external Geosign API integration.
 * Contains base URL, API key, and utility functions for making requests.
 *
 * **Base URL**: https://api-dev.geosign.toknox.com
 * **Authentication**: x-api-key header
 */

export const API_CONFIG = {
  BASE_URL: 'https://api-dev.geosign.toknox.com',
  API_KEY: 'Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4',
  ENDPOINTS: {
    PRODUCTS: {
      GET_ALL: '/product',
      CREATE: '/product/create',
    },
    MAINTENANCE: {
      GET_ALL: '/maintenance',
      CREATE: '/maintenance/create',
    },
  },
} as const;

/**
 * Get headers for API requests
 */
export function getApiHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_CONFIG.API_KEY,
  };
}

/**
 * Make a GET request to the API
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getApiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make a POST request to the API
 */
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getApiHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
