import { request } from './apiClient';

export function login(nombreUsuario, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({
      email: nombreUsuario,
      password
    })
  });
}

export function logout(token) {
  return request('/logout', { method: 'POST' }, token);
}
