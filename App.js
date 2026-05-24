import React from 'react';
import Navigation from './Navigation';
import { CarritoProvider } from './context/CarritoContext';
import { ConfigProvider } from './context/ConfigContext';

export default function App() {
  return (
    <ConfigProvider>
      <CarritoProvider>
        <Navigation />
      </CarritoProvider>
    </ConfigProvider>
  );
}
