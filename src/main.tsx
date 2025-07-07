import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import './styles/globals.css';
import './styles/style.scss';
import App from './App';
import { Clock } from './pages/clock';
import { SpeechRecognition } from './pages/speech-recognition';

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
  {
    path: '/speech-recognition',
    element: <SpeechRecognition />,
  },
]);

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
