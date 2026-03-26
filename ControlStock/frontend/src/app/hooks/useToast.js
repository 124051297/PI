import { useState, useCallback } from 'react';
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, {
      id,
      type,
      message
    }]);
  }, []);
  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  const success = useCallback(message => addToast('success', message), [addToast]);
  const error = useCallback(message => addToast('error', message), [addToast]);
  const warning = useCallback(message => addToast('warning', message), [addToast]);
  const info = useCallback(message => addToast('info', message), [addToast]);
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
}