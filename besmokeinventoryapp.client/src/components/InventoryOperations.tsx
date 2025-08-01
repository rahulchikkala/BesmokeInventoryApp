import React, { useEffect, useState } from 'react';
import { getInventoryOperations } from '../services/ProductService';
import type { InventoryOperation } from '../services/ProductService';

interface Props {
  limit?: number;
  title?: string;
}

const InventoryOperations: React.FC<Props> = ({ limit, title = 'Inventory Operations' }) => {
  const [ops, setOps] = useState<InventoryOperation[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getInventoryOperations();
      setOps(data);
    };
    load();
  }, []);

  if (ops.length === 0) return null;

  return (
    <div className="mt-4">
      <h4>{title}</h4>
      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr>
            <th>Product ID</th>
            <th>Change</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
       {(limit ? ops.slice(0, limit) : ops).map(op => (
            <tr key={op.id}>
              <td>{op.productId}</td>
              <td>{op.quantityChange}</td>
              <td>{new Date(op.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryOperations;