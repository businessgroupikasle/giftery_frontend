import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';

/**
 * useFetch — Generic data fetching hook
 *
 * @param {string} url - API endpoint
 * @param {boolean} autoFetch - Whether to automatically fetch on mount/url change (default true)
 * @returns {{ data, loading, error, fetch, reset }}
 */
const useFetch = (url, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (params = {}) => {
      if (!url) return;
      setLoading(true);
      setError(null);
      try {
        const result = await axiosInstance.get(url, { params });
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    if (autoFetch && url) {
      fetchData();
    }
  }, [autoFetch, fetchData, url]);

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, loading, error, fetch: fetchData, reset };
};

export default useFetch;
