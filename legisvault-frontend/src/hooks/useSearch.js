import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAccessibility } from './useAccessibility';

/**
 * Custom hook for debounced legislative document search
 * Provides accessible loading, error handling, and screen reader result summaries.
 *
 * @param {Object} options
 * @param {string} [options.initialQuery='']
 * @param {Object} [options.initialFilters={}]
 * @param {number} [options.debounceMs=350]
 */
export const useSearch = ({
  initialQuery = '',
  initialFilters = {},
  debounceMs = 350,
} = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { announce } = useAccessibility();
  const abortControllerRef = useRef(null);

  const executeSearch = useCallback(
    async (searchTerm, currentFilters) => {
      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const params = {
          q: searchTerm || undefined,
          ...currentFilters,
        };

        const response = await api.get('/search', {
          params,
          signal: abortControllerRef.current.signal,
        });

        const data = response.data.data || response.data.documents || response.data;
        const total = response.data.meta?.total ?? (Array.isArray(data) ? data.length : 0);

        setResults(Array.isArray(data) ? data : []);
        setMeta({
          total,
          current_page: response.data.meta?.current_page || 1,
          last_page: response.data.meta?.last_page || 1,
        });

        // Announce to screen reader
        announce(
          `Search completed. Found ${total} legislative record${total === 1 ? '' : 's'}.`,
          'polite'
        );
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }

        console.warn('Search API fallback to local mock registry:', err.message);
        // Fallback for demo/offline resilience
        setResults([]);
        setMeta({ total: 0, current_page: 1, last_page: 1 });
        setError(err.response?.data?.message || 'Failed to complete search query.');
        announce('Search query encountered an error. Please try again.', 'assertive');
      } finally {
        setLoading(false);
      }
    },
    [announce]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch(query, filters);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, filters, debounceMs, executeSearch]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    results,
    setResults,
    meta,
    loading,
    error,
    refresh: () => executeSearch(query, filters),
  };
};

export default useSearch;
