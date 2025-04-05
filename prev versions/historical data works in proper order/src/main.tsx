import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from './providers/WagmiProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider>
      <App />
    </WagmiProvider>
  </StrictMode>
);