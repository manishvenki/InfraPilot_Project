import React from 'react';
import { Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Docker from './pages/Docker';
import Kubernetes from './pages/Kubernetes';
import Deployments from './pages/Deployments';
import Monitoring from './pages/Monitoring';
import About from './pages/About';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

/**
 * Route configurations for the InfraPilot suite.
 * Each configuration contains:
 * - path: browser url string
 * - element: React component to load
 * - isProtected: if true, requires authentication
 */
export const routesConfig = [
  {
    path: '/login',
    element: <Login />,
    isProtected: false,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    isProtected: true,
  },
  {
    path: '/deployments',
    element: <Deployments />,
    isProtected: true,
  },
  {
    path: '/docker',
    element: <Docker />,
    isProtected: true,
  },
  {
    path: '/kubernetes',
    element: <Kubernetes />,
    isProtected: true,
  },
  {
    path: '/monitoring',
    element: <Monitoring />,
    isProtected: true,
  },
  {
    path: '/settings',
    element: <Settings />,
    isProtected: true,
  },
  {
    path: '/about',
    element: <About />,
    isProtected: true,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    isProtected: true,
  },
  {
    path: '*',
    element: <NotFound />,
    isProtected: false,
  },
];
