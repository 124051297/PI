const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
};

const getJsonHeaders = (extraHeaders = {}) => getHeaders({
  'Content-Type': 'application/json',
  ...extraHeaders
});

const handleResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().join(' ')
      : null;
    throw new Error(validationMessage || data?.message || 'Error en la peticion');
  }

  return data;
};

export const api = {
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ email, password })
      });
      return await handleResponse(response);
    },
    logout: async () => {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getJsonHeaders()
      });
      localStorage.removeItem('token');
      return await handleResponse(response);
    },
    changePassword: async (currentPassword, newPassword) => {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: newPassword
        })
      });
      return await handleResponse(response);
    }
  },
  productos: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/productos`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    create: async (producto) => {
      const response = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(producto)
      });
      return await handleResponse(response);
    },
    update: async (id, producto) => {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(producto)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: getJsonHeaders()
      });
      return await handleResponse(response);
    }
  },
  entradas: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/entradas`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    create: async (entrada) => {
      const response = await fetch(`${API_BASE_URL}/entradas`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(entrada)
      });
      return await handleResponse(response);
    }
  },
  salidas: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/salidas`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    create: async (salida) => {
      const response = await fetch(`${API_BASE_URL}/salidas`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(salida)
      });
      return await handleResponse(response);
    }
  },
  empleados: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/empleados`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    create: async (empleado) => {
      const response = await fetch(`${API_BASE_URL}/empleados`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(empleado)
      });
      return await handleResponse(response);
    },
    update: async (id, empleado) => {
      const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(empleado)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'DELETE',
        headers: getJsonHeaders()
      });
      return await handleResponse(response);
    }
  },
  areas: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/areas`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/areas/${id}`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    create: async (area) => {
      const response = await fetch(`${API_BASE_URL}/areas`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(area)
      });
      return await handleResponse(response);
    },
    update: async (id, area) => {
      const response = await fetch(`${API_BASE_URL}/areas/${id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(area)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/areas/${id}`, {
        method: 'DELETE',
        headers: getJsonHeaders()
      });
      return await handleResponse(response);
    }
  },
  dashboard: {
    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    }
  },
  usuarios: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/usuarios`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    },
    uploadPhoto: async (id, file) => {
      const formData = new FormData();
      formData.append('foto_perfil', file);

      const response = await fetch(`${API_BASE_URL}/usuarios/${id}/foto-perfil`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });
      return await handleResponse(response);
    }
  },
  configuraciones: {
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/configuraciones`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    updateLogo: async (input) => {
      const isFile = typeof File !== 'undefined' && input instanceof File;

      const response = await fetch(`${API_BASE_URL}/configuraciones/logo`, {
        method: 'POST',
        headers: isFile ? getHeaders() : getJsonHeaders(),
        body: isFile ? (() => {
          const formData = new FormData();
          formData.append('logo_file', input);
          return formData;
        })() : JSON.stringify({ logo: input })
      });
      return await handleResponse(response);
    },
    resetLogo: async () => {
      const response = await fetch(`${API_BASE_URL}/configuraciones/logo`, {
        method: 'DELETE',
        headers: getJsonHeaders()
      });
      return await handleResponse(response);
    }
  },
  notificaciones: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/notificaciones`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/${id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/${id}`, {
        method: 'DELETE',
        headers: getJsonHeaders()
      });
      return await handleResponse(response);
    },
    markAllAsRead: async () => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/mark-all-read`, {
        method: 'POST',
        headers: getJsonHeaders()
      });
      return await handleResponse(response);
    },
    getUnreadCount: async () => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/unread-count`, { headers: getJsonHeaders() });
      return await handleResponse(response);
    }
  },
  reportes: {
    get: async (params = {}) => {
      const search = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          search.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/reportes?${search.toString()}`, {
        headers: getJsonHeaders()
      });
      return await handleResponse(response);
    }
  }
};
