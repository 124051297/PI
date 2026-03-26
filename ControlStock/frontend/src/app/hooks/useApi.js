import { useState, useCallback } from 'react';
// Simulación de llamada a API REST
const simulateApiCall = async (data, delay = 1000) => {
  await new Promise(resolve => setTimeout(resolve, delay));

  // Simular fallo ocasional (10% de probabilidad)
  if (Math.random() < 0.1) {
    throw new Error('Error de conexión con el servidor');
  }
  return data;
};
export function useApi(apiFunction) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    success: false
  });
  const execute = useCallback(async (...args) => {
    setState({
      data: null,
      loading: true,
      error: null,
      success: false
    });
    try {
      const result = await apiFunction(...args);
      setState({
        data: result,
        loading: false,
        error: null,
        success: true
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      });
      return null;
    }
  }, [apiFunction]);
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);
  return {
    ...state,
    execute,
    reset
  };
}

// Hook específico para fetch de datos
export function useFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchData = useCallback(async apiCall => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    data,
    loading,
    error,
    fetchData,
    setData
  };
}
export { simulateApiCall };