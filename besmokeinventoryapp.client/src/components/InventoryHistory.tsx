import React, { useEffect, useState, useCallback } from 'react';
import { getPagedInventoryOperations, getProducts } from '../services/ProductService';
import type { InventoryOperation, Product, PagedQuery } from '../services/ProductService';

const InventoryHistory: React.FC = () => {
  const [ops, setOps] = useState<InventoryOperation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'product' | 'productId' | 'change' | 'timestamp'>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
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
  const filteredOps = ops.filter(op => {
    const product = products.find(p => p.id === op.productId);
    const name = product ? product.name : op.productName;
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      op.productId.toString().includes(search)
    );
  });
  const sortedOps = [...filteredOps].sort((a, b) => {
    let cmp = 0;
    const nameA = (products.find(p => p.id === a.productId)?.name ?? a.productName).toLowerCase();
    const nameB = (products.find(p => p.id === b.productId)?.name ?? b.productName).toLowerCase();
    switch (sortKey) {
      case 'id':
        cmp = (a.id ?? 0) - (b.id ?? 0);
        break;
      case 'product':
        cmp = nameA.localeCompare(nameB);
        break;
      case 'productId':
        cmp = a.productId - b.productId;
        break;
      case 'change':
        cmp = a.quantityChange - b.quantityChange;
        break;
      case 'timestamp':
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };
  return (
    <div className="mt-4">
      <h4>Inventory History</h4>
     <div className="mb-2">
        <input
          className="form-control"
          placeholder="Search by product name or ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {filteredOps.length === 0 ? (
        <p>No operations found.</p>
      ) : (
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
<th onClick={() => handleSort('id')}>
              ID {sortKey === 'id' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('product')}>
              Product {sortKey === 'product' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('productId')}>
              Product ID {sortKey === 'productId' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('change')}>
              Change {sortKey === 'change' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('timestamp')}>
              Timestamp {sortKey === 'timestamp' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            </tr>
          </thead>
          <tbody>
          {sortedOps.map(op => {
              const product = products.find(p => p.id === op.productId);
              const name = product
                ? op.productName !== product.name
                  ? `${op.productName} (now ${product.name})`
                  : op.productName
                : op.productName;
              return (
                <tr key={op.id}>
                <td>{op.id}</td>
                  <td>{name}</td>
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