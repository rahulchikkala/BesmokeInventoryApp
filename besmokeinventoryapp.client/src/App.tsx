import React from 'react';
import ProductInventory from './components/ProductInventory';
import AddProduct from './components/AddProduct';
import InventoryOperations from './components/InventoryOperations';
import LowStockAlert from './components/LowStockAlert';

const App: React.FC = () => {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f7f7', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>Besmoke Inventory App</h1>
      <AddProduct />
      <LowStockAlert />
      <ProductInventory />
      <InventoryOperations />
    </div>
  );
};

export default App;
