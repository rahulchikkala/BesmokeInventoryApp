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
    <div className="alert alert-warning" role="alert">
      <strong>Warning:</strong> Some products are low on stock!
      <ul className="mb-0" style={{ maxHeight: '150px', overflowY: 'auto' }}>
        {lowStock.map((item, idx) => (
          <li key={idx}>Product ID {item.productId}: {item.availableQuantity} left</li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
