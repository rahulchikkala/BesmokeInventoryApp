import React, { useEffect, useState } from 'react';
import { getInventoryOperations } from '../services/ProductService';
import type { InventoryOperation } from '../services/ProductService';

const InventoryOperations: React.FC = () => {
  const [ops, setOps] = useState<InventoryOperation[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getInventoryOperations();
      setOps(data);
    };
    load();
  }, []);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Recent Inventory Operations</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead>
          <tr>
            <th style={thStyle}>Product ID</th>
            <th style={thStyle}>Change</th>
            <th style={thStyle}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {ops.map(op => (
            <tr key={op.id}>
              <td style={tdStyle}>{op.productId}</td>
              <td style={tdStyle}>{op.quantityChange}</td>
              <td style={tdStyle}>{new Date(op.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  backgroundColor: '#eee'
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
};

export default InventoryOperations;
