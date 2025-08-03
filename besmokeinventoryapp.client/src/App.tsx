import 'bootstrap/dist/css/bootstrap.min.css';
import ProductInventory from './components/ProductInventory';
import LowStockAlert from './components/LowStockAlert';
import RecentOperations from './components/RecentOperations';
import InventoryHistory from './components/InventoryHistory';
import { useState } from 'react';

function App() {
  const [page, setPage] = useState<'inventory' | 'operations' | 'history'>('inventory');
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const handleNavigate = (id: number) => {
    setHighlightId(id);
    setPage('inventory');
  };
  return (
    <div className="container-fluid p-0">
   <header className="sticky-top bg-light border-bottom py-2">
        <h1
          className="main-heading mb-1 d-flex justify-content-center align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => setPage('inventory')}
        >
          <i className="bi bi-box-seam me-2"></i>
          Besmoke Inventory Dashboard
        </h1>
     <ul className="nav nav-tabs justify-content-center mb-0">
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
      </header>
      {page === 'inventory' && (
        <ProductInventory
          highlightId={highlightId}
          onHighlightDone={() => setHighlightId(null)}
        />
      )}
      {page === 'operations' && <RecentOperations />}
      {page === 'history' && <InventoryHistory />}
       <LowStockAlert onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
