import 'bootstrap/dist/css/bootstrap.min.css';
import ProductInventory from './components/ProductInventory';
import LowStockAlert from './components/LowStockAlert';
import RecentOperations from './components/RecentOperations';
import InventoryHistory from './components/InventoryHistory';
import { useState } from 'react';

function App() {
  const [page, setPage] = useState<'inventory' | 'operations' | 'history'>('inventory');
  return (
    <div className="container mt-4">
      <h1 className="section-title text-center text-primary mb-4">Besmoke Inventory Dashboard</h1>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${page === 'inventory' ? 'active' : ''}`}
            onClick={() => setPage('inventory')}
          >
            Inventory
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${page === 'operations' ? 'active' : ''}`}
            onClick={() => setPage('operations')}
          >
            Recent Operations
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${page === 'history' ? 'active' : ''}`}
            onClick={() => setPage('history')}
          >
            Inventory History
          </button>
        </li>
      </ul>

      {page === 'inventory' && (
        <>
          <LowStockAlert />
          <ProductInventory />
        </>
      )}
      {page === 'operations' && <RecentOperations />}
      {page === 'history' && <InventoryHistory />}
    </div>
  );
}

export default App;
