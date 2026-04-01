import { request } from './apiClient';

export const inventoryService = {
  productos: (token) => request('/productos', {}, token),
  entradas: (token) => request('/entradas', {}, token),
  salidas: (token) => request('/salidas', {}, token),
  notificaciones: (token) => request('/notificaciones', {}, token),
  crearEntrada: (payload, token) => request('/entradas', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, token),
  crearSalida: (payload, token) => request('/salidas', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, token),
  marcarNotificacion: (id, payload, token) => request(`/notificaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, token),
  marcarTodasNotificaciones: (token) => request('/notificaciones/marcar-todas', {
    method: 'POST'
  }, token),
  eliminarNotificacion: (id, token) => request(`/notificaciones/${id}`, {
    method: 'DELETE'
  }, token),
  dashboardStats: (token) => request('/dashboard/stats', {}, token),
  areas: (token) => request('/areas', {}, token),
  updateProfile: (id, payload, token) => request(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, token),
  updateProfilePhoto: (id, formData, token) => request(`/usuarios/${id}/foto-perfil`, {
    method: 'POST',
    body: formData
  }, token)
};
