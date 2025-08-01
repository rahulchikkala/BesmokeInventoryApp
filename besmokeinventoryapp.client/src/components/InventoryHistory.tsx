import React, { useEffect, useState, useCallback } from 'react';
import { getPagedInventoryOperations, getProducts } from '../services/ProductService';
import type { InventoryOperation, Product, PagedQuery } from '../services/ProductService';

const InventoryHistory: React.FC = () => {
  const [ops, setOps] = useState<InventoryOperation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAll = useCallback(async () => {
    const query: PagedQuery = { page, pageSize };
    const [{ operations, totalCount }, prods] = await Promise.all([
      getPagedInventoryOperations(query),
      getProducts()
    ]);
    setOps(operations);
    setProducts(prods);
    setTotalCount(totalCount);
  }, [page, pageSize]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="mt-4">
      <h4>Inventory History</h4>
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
            {ops.map(op => {
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
      <div className="d-flex justify-content-between align-items-center my-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InventoryHistory;