import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useLogo() {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const config = await api.configuraciones.get();
        if (config.logo_empresa_url) {
          setLogo(config.logo_empresa_url);
        } else if (config.logo_empresa) {
          setLogo(config.logo_empresa);
        } else {
          setLogo(null);
        }
      } catch (e) {
        console.error("Failed to load logo", e);
      }
    }
    fetchLogo();
  }, []);

  return logo;
}
