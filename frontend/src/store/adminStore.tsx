'use client';
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { AdminUser } from '../services/adminApi';

interface AdminState {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  isLoading: boolean;
}

type AdminAction =
  | { type: 'SET_USER'; payload: AdminUser }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AdminState = {
  adminUser: null,
  isAuthenticated: false,
  sidebarOpen: true,
  isLoading: true,
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, adminUser: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AdminContext = createContext<{
  state: AdminState;
  setUser: (user: AdminUser) => void;
  logout: () => void;
  toggleSidebar: () => void;
} | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  useEffect(() => {
    // Rehydrate from localStorage
    const stored = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_access_token');
    if (stored && token) {
      try {
        dispatch({ type: 'SET_USER', payload: JSON.parse(stored) });
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setUser = (user: AdminUser) => {
    localStorage.setItem('admin_user', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
  };

  const logout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    dispatch({ type: 'LOGOUT' });
  };

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });

  return (
    <AdminContext.Provider value={{ state, setUser, logout, toggleSidebar }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminStore must be used within AdminProvider');
  return ctx;
}
