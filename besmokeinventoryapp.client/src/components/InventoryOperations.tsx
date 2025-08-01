import React, { useEffect, useState } from 'react';
import { getInventoryOperations, getProducts } from '../services/ProductService';
import type { InventoryOperation, Product } from '../services/ProductService';
interface Props {
  limit?: number;
  title?: string;
}

const InventoryOperations: React.FC<Props> = ({ limit, title = 'Inventory Operations' }) => {
  const [ops, setOps] = useState<InventoryOperation[]>([]);
const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      const [opsData, productData] = await Promise.all([
        getInventoryOperations(),
        getProducts()
      ]);
      setOps(opsData);
      setProducts(productData);
    };
    load();
  }, []);



  return (
    <div className="mt-4">
      <h4>{title}</h4>
      {ops.length === 0 ? (
        <p>No operations found.</p>
      ) : (
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
             <th>ID</th>
              <th>Product</th>
               <th>Product ID</th>
              <th>Change</th>
              <th>Timestamp</th>
            </tr>
         
   
        </thead>
          <tbody>
         {(limit ? ops.slice(0, limit) : ops).map(op => {
            const product = products.find(p => p.id === op.productId);
            return (
              <tr key={op.id}>
              <td>{op.id}</td>
                <td>{product ? product.name : op.productId}</td>
                <td>{op.productId}</td>
                <td>{op.quantityChange}</td>
                <td>{new Date(op.timestamp).toLocaleString()}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryOperations;