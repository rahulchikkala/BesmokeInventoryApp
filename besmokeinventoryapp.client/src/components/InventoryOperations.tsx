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
               <th>Type</th>
              <th>Size</th>
              <th>Material</th>
              <th>Change</th>
              <th>Available</th>
              <th>Action</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
         
   
        </thead>
          <tbody>
         {(limit ? ops.slice(0, limit) : ops).map(op => {
            const product = products.find(p => p.id === op.productId);
            const name = product
              ? op.productName !== product.name
                ? `${op.productName} (now ${product.name})`
                : op.productName
              : op.productName;
              const type = product
              ? op.productType !== product.type
                ? `${op.productType} (now ${product.type})`
                : op.productType
              : op.productType;
            const size = product
              ? op.size !== product.size
                ? `${op.size} (now ${product.size})`
                : op.size
              : op.size;
            const material = product
              ? op.material !== product.material
                ? `${op.material} (now ${product.material})`
                : op.material
              : op.material;
            return (
              <tr key={op.id}>
               <td>{op.id}</td>
                <td>{name}</td>
                <td>{op.productId}</td>
                <td>{type}</td>
                <td>{size}</td>
                <td>{material}</td>
                <td>{op.quantityChange > 0 ? `+${op.quantityChange}` : op.quantityChange}</td>
                <td>{op.availableQuantity}</td>
                <td>{op.operationType}</td>
                 <td>{op.changeDescription}</td>
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