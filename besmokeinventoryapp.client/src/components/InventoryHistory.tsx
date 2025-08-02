import React, { useEffect, useState, useCallback } from 'react';
import { getPagedInventoryOperations, getInventoryOperations, getProducts } from '../services/ProductService';
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
  const [timeFilter, setTimeFilter] = useState('all');

  const getRange = useCallback(() => {
    const now = new Date();
    switch (timeFilter) {
      case '1h':
        return { startTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), endTime: now.toISOString() };
      case '24h':
        return { startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), endTime: now.toISOString() };
      case '7d':
        return { startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), endTime: now.toISOString() };
      case '24d':
        return { startTime: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000).toISOString(), endTime: now.toISOString() };
      default:
        return {};
    }
  }, [timeFilter]);
  const fetchAll = useCallback(async () => {
      const range = getRange();
  if (search) {
    const [allOps, prods] = await Promise.all([
     getInventoryOperations(range.startTime, range.endTime),
      getProducts()
    ]);
    setOps(allOps);
    setProducts(prods);
    setTotalCount(allOps.length);
  } else {
    const query: PagedQuery = { page, pageSize, ...range };
    const [{ operations, totalCount }, prods] = await Promise.all([
      getPagedInventoryOperations(query),
      getProducts()
    ]);
    setOps(operations);
    setProducts(prods);
    setTotalCount(totalCount);
  }
}, [page, pageSize, search, getRange]);


   useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  
  const filteredOps = ops.filter(op => {
    const product = products.find(p => p.id === op.productId);
    const name = product ? product.name : op.productName;
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      op.productId.toString().includes(search)
    );
  });
 const totalPages = search
    ? Math.ceil(filteredOps.length / pageSize) || 1
    : Math.ceil(totalCount / pageSize) || 1;
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
  const paginatedOps = search
    ? sortedOps.slice((page - 1) * pageSize, page * pageSize)
    : sortedOps;

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [totalPages, page]);
  
  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };
  const exportCsv = async () => {
    const range = getRange();
    const allOps = await getInventoryOperations(range.startTime, range.endTime);
    const filtered = allOps.filter(op => {
      const product = products.find(p => p.id === op.productId);
      const name = product ? product.name : op.productName;
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        op.productId.toString().includes(search)
      );
    });
    const rows = filtered.map(op => {
      const product = products.find(p => p.id === op.productId);
      const name = product ? product.name : op.productName;
       const type = product ? product.type : op.productType;
      const size = product ? product.size : op.size;
      const material = product ? product.material : op.material;
      return [
        op.id ?? '',
        name,
        op.productId,
        type,
        size,
        material,
        op.quantityChange,
        op.availableQuantity,
        op.operationType,
        op.changeDescription ?? '',
        new Date(op.timestamp).toLocaleString()
      ];
    });
    const header = ['ID', 'Product', 'Product ID', 'Type', 'Size', 'Material', 'Change', 'Available', 'Action', 'Details', 'Timestamp'];
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
   <div className="card shadow-sm p-4 mt-4">
      <h4 className="section-title text-primary">Inventory History</h4>
    <div className="mb-2 d-flex gap-2">
        <input
          className="form-control"
          placeholder="Search by product name or ID"
          value={search}
        onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="form-select w-auto"
          value={timeFilter}
          onChange={e => {
            setTimeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Time</option>
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="24d">Last 24 Days</option>
        </select>
        <button className="btn btn-sm btn-primary" onClick={exportCsv}>Export CSV</button>
      </div>
      {filteredOps.length === 0 ? (
        <p>No operations found.</p>
      ) : (
         <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered table-sm align-middle">
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
            <th>Type</th>
            <th>Size</th>
            <th>Material</th>
            <th onClick={() => handleSort('change')}>
              Change {sortKey === 'change' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th>Available</th>
            <th>Action</th>
              <th>Details</th>
            <th onClick={() => handleSort('timestamp')}>
              Timestamp {sortKey === 'timestamp' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            </tr>
          </thead>
          <tbody>
          {paginatedOps.map(op => {
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
         </div>
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