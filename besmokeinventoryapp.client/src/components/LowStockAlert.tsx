import React, { useEffect, useState } from 'react';
import { getLowStock, getProducts } from '../services/ProductService';
import type { InventoryStatus, Product } from '../services/ProductService';

interface LowStockItem extends InventoryStatus {
  name: string;
}

interface Props {
  onNavigate?: (id: number) => void;
}

const LowStockAlert: React.FC<Props> = ({ onNavigate }) => {
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
       const [stockData, products] = await Promise.all([
        getLowStock(),
        getProducts(),
      ]);
      const combined = stockData.map((s) => ({
        ...s,
        name:
          products.find((p: Product) => p.id === s.productId)?.name ||
          `ID ${s.productId}`,
      }));
      setLowStock(combined);

    };
    load();
  }, []);

  if (lowStock.length === 0) return null;
  const goToProduct = (id: number) => {
   if (onNavigate) {
      onNavigate(id);
    } else {
      const row = document.getElementById(`product-${id}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('table-warning');
        setTimeout(() => row.classList.remove('table-warning'), 2000);
      }
    }
    setOpen(false);
  };
  return (
    <div style={containerStyle}>
      <button
     className="btn btn-warning btn-sm position-relative p-2"
        onClick={() => setOpen((o) => !o)}
      >
        <i className="bi bi-bell-fill bell-ring fs-6" />
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
          <ul className="mb-2 mt-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {lowStock.map((item, idx) => (
              <li key={idx}>
               <button
                  className="btn btn-link p-0 text-start"
                  onClick={() => goToProduct(item.productId)}
                >
                  {item.name}: {item.availableQuantity} left
                </button>
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
  width: '300px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
};

export default LowStockAlert;
