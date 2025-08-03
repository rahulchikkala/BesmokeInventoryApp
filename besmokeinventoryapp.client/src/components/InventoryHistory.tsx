import React, { useEffect, useState, useCallback } from 'react';
import { getPagedInventoryOperations, getInventoryOperations, getProducts } from '../services/ProductService';
import type { InventoryOperation, Product, PagedQuery } from '../services/ProductService';
import ExpandableCell from './ExpandableCell';

const InventoryHistory: React.FC = () => {
  const [ops, setOps] = useState<InventoryOperation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'product' | 'productId' | 'type' | 'size' | 'material' | 'available' | 'change' | 'timestamp'>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [message, setMessage] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState('');
  

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
    try {
      const range = getRange();
      if (search) {
        const [allOps, prods] = await Promise.all([
          getInventoryOperations(range.startTime, range.endTime),
          getProducts(),
        ]);
        setOps(allOps);
        setProducts(prods);
        setTotalCount(allOps.length);
      } else {
        const query: PagedQuery = { page, pageSize, ...range };
        const [{ operations, totalCount }, prods] = await Promise.all([
          getPagedInventoryOperations(query),
          getProducts(),
        ]);
        setOps(operations);
        setProducts(prods);
        setTotalCount(totalCount);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setMessage('Failed to load history');
    }
  }, [page, pageSize, search, getRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

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
    const typeA = (products.find(p => p.id === a.productId)?.type ?? a.productType).toLowerCase();
    const typeB = (products.find(p => p.id === b.productId)?.type ?? b.productType).toLowerCase();
    const sizeA = (products.find(p => p.id === a.productId)?.size ?? a.size).toLowerCase();
    const sizeB = (products.find(p => p.id === b.productId)?.size ?? b.size).toLowerCase();
    const materialA = (products.find(p => p.id === a.productId)?.material ?? a.material).toLowerCase();
    const materialB = (products.find(p => p.id === b.productId)?.material ?? b.material).toLowerCase();
    switch (sortKey) {
      case 'id': cmp = (a.id ?? 0) - (b.id ?? 0); break;
      case 'product': cmp = nameA.localeCompare(nameB); break;
      case 'productId': cmp = a.productId - b.productId; break;
      case 'type': cmp = typeA.localeCompare(typeB); break;
      case 'size': cmp = sizeA.localeCompare(sizeB); break;
      case 'material': cmp = materialA.localeCompare(materialB); break;
      case 'available': cmp = a.availableQuantity - b.availableQuantity; break;
      case 'change': cmp = a.quantityChange - b.quantityChange; break;
      case 'timestamp': cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); break;
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

  const getSortIcon = (key: typeof sortKey) => {
    if (sortKey !== key) return 'bi-chevron-expand';
    return sortAsc ? 'bi-chevron-up' : 'bi-chevron-down';
  };

  const exportCsv = async () => {
    try {
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
          new Date(op.timestamp).toLocaleString(),
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
    } catch (error) {
      console.error('Failed to export CSV:', error);
      setMessage('Failed to export CSV');
    }
  };

  const toastStyle: React.CSSProperties = {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '4px',
    zIndex: 2000,
  };

  return (
    <>
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <h4 className="section-title text-primary mb-0 flex-grow-1 text-center text-md-start">
              Inventory History
            </h4>
            <div className="search-bar d-flex align-items-center">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search by product name or ID"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="form-select w-auto"
              value={timeFilter}
              onChange={(e) => {
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
            <button className="btn btn-sm btn-primary" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <table className="table table-striped table-hover table-bordered table-sm align-middle text-center slim-table">
              <thead className="table-light sticky-top" style={{ top: 0 }}>
                <tr>
                  <th className="sortable text-center" onClick={() => handleSort('id')}>
                    ID <i className={`bi ${getSortIcon('id')}`}></i>
                  </th>
                  <th className="sortable text-center" onClick={() => handleSort('product')}>
                    Name <i className={`bi ${getSortIcon('product')}`}></i>
                  </th>
                  <th className="sortable text-center" onClick={() => handleSort('productId')}>
                    Product ID <i className={`bi ${getSortIcon('productId')}`}></i>
                  </th>
                  <th className="sortable text-center" onClick={() => handleSort('type')}>
                    Type <i className={`bi ${getSortIcon('type')}`}></i>
                  </th>
                  <th className="sortable text-center" onClick={() => handleSort('size')}>
                    Size <i className={`bi ${getSortIcon('size')}`}></i>
                  </th>
                  <th className="sortable text-center" onClick={() => handleSort('material')}>
                    Material <i className={`bi ${getSortIcon('material')}`}></i>
                  </th>
                  <th className="sortable text-center" onClick={() => handleSort('change')}>
                    Change <i className={`bi ${getSortIcon('change')}`}></i>
                  </th>
                  <th className="sortable text-center" onClick={() => handleSort('available')}>
                    Available <i className={`bi ${getSortIcon('available')}`}></i>
                  </th>
                  <th className="text-center">Action</th>
                  <th className="text-center">Details</th>
                  <th className="sortable text-center" onClick={() => handleSort('timestamp')}>
                    Timestamp <i className={`bi ${getSortIcon('timestamp')}`}></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOps.map((op) => {
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
                      <td><ExpandableCell text={name} maxWidth={150} /></td>
                      <td>{op.productId}</td>
                      <td><ExpandableCell text={type} maxWidth={120} /></td>
                      <td><ExpandableCell text={size} maxWidth={120} /></td>
                      <td><ExpandableCell text={material} maxWidth={120} /></td>
                      <td>{op.quantityChange > 0 ? `+${op.quantityChange}` : op.quantityChange}</td>
                      <td>{op.availableQuantity}</td>
                      <td>{op.operationType}</td>
                      <td><ExpandableCell text={op.changeDescription ?? ''} maxWidth={150} /></td>
                      <td>{new Date(op.timestamp).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-center align-items-center gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
            className="form-control form-control-sm w-auto"
          />
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              const p = Number(pageInput);
              if (!pageInput || isNaN(p) || p < 1 || p > totalPages) {
                setMessage('Page not found');
              } else {
                setPage(p);
              }
              setPageInput('');
            }}
          >
            Go
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
          >
            Last
          </button>
        </div>
      </div>
      {message && <div style={toastStyle}>{message}</div>}
    </>
  );
};

export default InventoryHistory;