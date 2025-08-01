import React from 'react';
import ProductInventory from './ProductInventory';

const App: React.FC = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Besmoke Inventory App</h1>
      <ProductInventory />
    </div>
  );
};

export default App;
