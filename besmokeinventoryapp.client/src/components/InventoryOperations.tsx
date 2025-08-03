import React, { useEffect, useState } from 'react';
import { getInventoryOperations, getProducts } from '../services/ProductService';
import type { InventoryOperation, Product } from '../services/ProductService';
import ExpandableCell from './ExpandableCell';
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
        getProducts(),
      ]);
      setOps(opsData);
      setProducts(productData);
    };
    load();
  }, []);



  return (
   <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h4 className="section-title text-primary mb-0 text-center text-md-start">{title}</h4>
      </div>
      <div className="card-body p-0">
        {ops.length === 0 ? (
          <p className="text-center my-3">No operations found.</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <table className="table table-striped table-hover table-bordered table-sm align-middle text-center slim-table">
              <thead className="table-light sticky-top" style={{ top: 0 }}>
                <tr>
                  <th className="text-center">ID</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">Product ID</th>
                  <th className="text-center">Type</th>
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
                {(limit ? ops.slice(0, limit) : ops).map((op) => {
                  const product = products.find((p) => p.id === op.productId);
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
                        <ExpandableCell text={name} maxWidth={150} />
                      </td>
                      <td>{op.productId}</td>
                      <td>
                        <ExpandableCell text={type} maxWidth={120} />
                      </td>
                      <td>
                        <ExpandableCell text={size} maxWidth={120} />
                      </td>
                      <td>
                        <ExpandableCell text={material} maxWidth={120} />
                      </td>
                      <td>{op.quantityChange > 0 ? `+${op.quantityChange}` : op.quantityChange}</td>
                      <td>{op.availableQuantity}</td>
                      <td>
                        <ExpandableCell text={op.operationType} maxWidth={120} />
                      </td>
                      <td>
                        <ExpandableCell text={op.changeDescription ?? ''} maxWidth={150} />
                      </td>
                    <td>
                        <ExpandableCell
                          text={new Date(op.timestamp).toLocaleString()}
                          maxWidth={180}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryOperations;