/**
 * storage.js — localStorage helpers for auth tokens
 */

const TOKEN_KEY = 'ec_access_token';
const USER_KEY = 'ec_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
export const setUser = (user) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearAuth = () => {
  removeToken();
  removeUser();
};
