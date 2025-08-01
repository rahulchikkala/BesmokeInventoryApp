import React, { useEffect, useState } from 'react';
import { getLowStock } from '../services/ProductService';
import type { InventoryStatus } from '../services/ProductService';

const LowStockAlert: React.FC = () => {
  const [lowStock, setLowStock] = useState<InventoryStatus[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getLowStock();
      setLowStock(data);
    };
    load();
  }, []);

  if (lowStock.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
      <strong>⚠️ Low Stock Alert:</strong>
      <ul>
        {lowStock.map(item => (
          <li key={item.productId}>Product ID {item.productId} — Qty: {item.availableQuantity}</li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
