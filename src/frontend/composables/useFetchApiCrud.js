import { useFetchApi } from './useFetchApi';

/**
 * Fetch data from an API and perform CRUD operations
 *
 * @param {string} path - The path to the API endpoint (e.g., 'users', 'posts')
 * @param {string} [baseUrl=null] - The base URL of the API
 * @param {object} [additionalHeaders={}] - Additional headers to send with each request
 * @returns {Object} The CRUD API utilities
 * @property {Function} read - Function to read a single resource
 * @property {Function} readAll - Function to read all resources
 * @property {Function} create - Function to create a resource
 * @property {Function} update - Function to update a resource
 * @property {Function} del - Function to delete a resource
 */
export function useFetchApiCrud(path, baseUrl = null, additionalHeaders = {}) {
  const { fetchApi, fetchApiToRef } = useFetchApi(baseUrl, additionalHeaders);

  /**
   * Read a single resource by ID
   * @param {string|number} id - The resource ID
   * @param {object} [options={}] - Additional options
   * @returns {Object} Reactive refs for data, error, and loading state
   */
  function read(id, { headers = {}, timeout = 5000 } = {}) {
    return fetchApiToRef({
      url: `${path}/${id}`,
      method: 'GET',
      headers,
      timeout,
    });
  }

  /**
   * Read all resources
   * @param {object} [options={}] - Additional options
   * @returns {Object} Reactive refs for data, error, and loading state
   */
  function readAll({ headers = {}, timeout = 5000 } = {}) {
    return fetchApiToRef({
      url: path,
      method: 'GET',
      headers,
      timeout,
    });
  }

  /**
   * Create a new resource
   * @param {object} data - The resource data
   * @param {object} [options={}] - Additional options
   * @returns {Object} Reactive refs for data, error, and loading state
   */
  function create(data, { headers = {}, timeout = 5000 } = {}) {
    return fetchApiToRef({
      url: path,
      method: 'POST',
      data,
      headers,
      timeout,
    });
  }

  /**
   * Update an existing resource
   * @param {string|number} id - The resource ID
   * @param {object} data - The update data
   * @param {object} [options={}] - Additional options
   * @returns {Object} Reactive refs for data, error, and loading state
   */
  function update(id, data, { headers = {}, timeout = 5000 } = {}) {
    return fetchApiToRef({
      url: `${path}/${id}`,
      method: 'PATCH',
      data,
      headers,
      timeout,
    });
  }

  /**
   * Delete a resource
   * @param {string|number} id - The resource ID
   * @param {object} [options={}] - Additional options
   * @returns {Object} Reactive refs for data, error, and loading state
   */
  function del(id, { headers = {}, timeout = 5000 } = {}) {
    return fetchApiToRef({
      url: `${path}/${id}`,
      method: 'DELETE',
      headers,
      timeout,
    });
  }

  return {
    read,
    readAll,
    create,
    update,
    del,
    // Expose the original fetchApi utilities for custom requests
    fetchApi,
    fetchApiToRef,
  };
}