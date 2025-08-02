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
    <div className="card shadow-sm p-4 mt-4">
      <h4 className="section-title text-primary">{title}</h4>
      {ops.length === 0 ? (
        <p>No operations found.</p>
      ) : (
       <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered table-sm align-middle text-center slim-table">
          <thead className="table-light">
            <tr>
             <th className="text-center">ID</th>
              <th className="text-center">Product Name</th>
               <th className="text-center">Product ID</th>
               <th className="text-center">Product Type</th>
              <th className="text-center">Size</th>
              <th className="text-center">Material</th>
              <th className="text-center">Change</th>
              <th className="text-center">Available</th>
              <th className="text-center">Action</th>
              <th className="text-center">Details</th>
              <th className="text-center">Timestamp</th>
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
                <td>
                <span
                  className="d-inline-block text-truncate"
                  style={{ maxWidth: '150px' }}
                  title={name}
                >
                  {name}
                </span>
               </td>
                <td>{op.productId}</td>
                <td>
                  <span
                    className="d-inline-block text-truncate"
                    style={{ maxWidth: '120px' }}
                    title={type}
                  >
                    {type}
                  </span>
                </td>
                <td>
                  <span
                    className="d-inline-block text-truncate"
                    style={{ maxWidth: '120px' }}
                    title={size}
                  >
                    {size}
                  </span>
                </td>
                <td>
                  <span
                    className="d-inline-block text-truncate"
                    style={{ maxWidth: '120px' }}
                    title={material}
                  >
                    {material}
                  </span>
                </td>
                <td>{op.quantityChange > 0 ? `+${op.quantityChange}` : op.quantityChange}</td>
                <td>{op.availableQuantity}</td>
                <td>{op.operationType}</td>
                <td>
                  <span
                    className="d-inline-block text-truncate"
                    style={{ maxWidth: '150px' }}
                    title={op.changeDescription ?? ''}
                  >
                    {op.changeDescription}
                  </span>
                </td>
                <td>{new Date(op.timestamp).toLocaleString()}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default InventoryOperations;