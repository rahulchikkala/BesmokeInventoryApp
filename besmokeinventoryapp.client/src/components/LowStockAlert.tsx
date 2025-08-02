import React, { useEffect, useState } from 'react';
import { getLowStock } from '../services/ProductService';
import type { InventoryStatus } from '../services/ProductService';

const LowStockAlert: React.FC = () => {
  const [lowStock, setLowStock] = useState<InventoryStatus[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getLowStock();
      setLowStock(data);
    };
    load();
  }, []);

  if (dismissed || lowStock.length === 0) return null;

  return (
    <div
      className="alert alert-warning alert-dismissible"
      role="alert"
      style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1050, maxWidth: '300px' }}
    >
      <strong>Warning:</strong> Some products are low on stock!
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => setDismissed(true)}
      />
      <ul className="mb-0 mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
        {lowStock.map((item, idx) => (
          <li key={idx}>Product ID {item.productId}: {item.availableQuantity} left</li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
