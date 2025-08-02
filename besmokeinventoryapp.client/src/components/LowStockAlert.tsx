import React, { useEffect, useState } from 'react';
import { getLowStock } from '../services/ProductService';
import type { InventoryStatus } from '../services/ProductService';

const LowStockAlert: React.FC = () => {
  const [lowStock, setLowStock] = useState<InventoryStatus[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getLowStock();
      setLowStock(data);
    };
    load();
  }, []);

  if (lowStock.length === 0) return null;

  return (
    <div style={containerStyle}>
      <button
        className="btn btn-warning position-relative"
        onClick={() => setOpen((o) => !o)}
      >
        <i className="bi bi-bell bell-ring" />
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {lowStock.length}
        </span>
      </button>
      {open && (
        <div style={popupStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Low Stock</strong>
            <button className="btn-close" onClick={() => setOpen(false)} />
          </div>
          <ul className="mb-2 mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {lowStock.map((item, idx) => (
              <li key={idx}>
                Product ID {item.productId}: {item.availableQuantity} left
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '1rem',
  right: '1rem',
  zIndex: 1050,
};

const popupStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '3rem',
  right: 0,
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '1rem',
  width: '200px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
};

export default LowStockAlert;
