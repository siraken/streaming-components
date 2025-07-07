import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import './styles/globals.css';
// import './styles/globals.css';
import App from './App.tsx';
import { Clock } from './pages/clock.tsx';
// import { Counter } from './pages/counter.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  // {
  //   path: '/counter',
  //   element: <Counter />,
  // },
  {
    path: '/clock',
    element: <Clock />,
  },
]);

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
