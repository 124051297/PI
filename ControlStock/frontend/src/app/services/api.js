const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};


const handleResponse = async (response) => {
    // 204 No Content (DELETE exitoso) no tiene body JSON
    if (response.status === 204) {
        return null;
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
    }
    return data;
};

export const api = {
  auth: {
    login: async (email, password) => {
      // Ajuste si el frontend pasa usuario en vez de email
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: email, password: password })
      });
      return await handleResponse(response);
    },
    logout: async () => {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
      localStorage.removeItem('token');
      return await handleResponse(response);
    }
  },
  productos: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/productos`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    create: async (producto) => {
      const response = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(producto)
      });
      return await handleResponse(response);
    },
    update: async (id, producto) => {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(producto)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await handleResponse(response);
    }
  },
  entradas: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/entradas`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    create: async (entrada) => {
      const response = await fetch(`${API_BASE_URL}/entradas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entrada)
      });
      return await handleResponse(response);
    }
  },
  salidas: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/salidas`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    create: async (salida) => {
      const response = await fetch(`${API_BASE_URL}/salidas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(salida)
      });
      return await handleResponse(response);
    }
  },
  empleados: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/empleados`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    create: async (empleado) => {
      const response = await fetch(`${API_BASE_URL}/empleados`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(empleado)
      });
      return await handleResponse(response);
    },
    update: async (id, empleado) => {
      const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(empleado)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await handleResponse(response);
    }
  },
  areas: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/areas`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    create: async (area) => {
      const response = await fetch(`${API_BASE_URL}/areas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(area)
      });
      return await handleResponse(response);
    },
    update: async (id, area) => {
      const response = await fetch(`${API_BASE_URL}/areas/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(area)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/areas/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await handleResponse(response);
    }
  },
  dashboard: {
    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getHeaders() });
      return await handleResponse(response);
    }
  },
  usuarios: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/usuarios`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    }
  },
  configuraciones: {
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/configuraciones`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    updateLogo: async (base64String) => {
      const response = await fetch(`${API_BASE_URL}/configuraciones/logo`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ logo: base64String })
      });
      return await handleResponse(response);
    }
  },
  notificaciones: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/notificaciones`, { headers: getHeaders() });
      return await handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await handleResponse(response);
    },
    markAllAsRead: async () => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/mark-all-read`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(response);
    },
    getUnreadCount: async () => {
      const response = await fetch(`${API_BASE_URL}/notificaciones/unread-count`, { headers: getHeaders() });
      return await handleResponse(response);
    }
  }
};