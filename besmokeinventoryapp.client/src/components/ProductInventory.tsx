import React, { useState, useEffect, useCallback } from 'react';
import AddProduct from './AddProduct';
import type {
  InventoryStatus,
  Product,
  ProductQuery,
} from '../services/ProductService';
import {
  getPagedProducts,
  getInventory,
  adjustInventory,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../services/ProductService';

const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [sortConfig, setSortConfig] = useState<
    { key: 'name' | 'type' | 'size' | 'material' | 'available'; direction: 'asc' | 'desc' } | null
  >(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<(Product & { available: number }) | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState('');
  const fetchData = useCallback(async () => {
    try {
if (search) {
        const id = parseInt(search, 10);
        const [products, inventory] = await Promise.all([
         searchProducts(!isNaN(id) ? id : undefined, !isNaN(id) ? undefined : search),
          getInventory(),
        ]);
        setProducts(products);
        setInventory(inventory);
        setTotalCount(products.length);
      } else {
        const query: ProductQuery = { page, pageSize };
        const [{ products, totalCount }, inventory] = await Promise.all([
          getPagedProducts(query),
          getInventory(),
        ]);
        setProducts(products);
        setInventory(inventory);
        setTotalCount(totalCount);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('Error loading data');
    }
  }, [page, pageSize, search]);
  const handleProductAdded = async () => {
    await fetchData();
    setMessage('Product added!');
  };
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(1);
  }, [search]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const getQuantity = (productId: number) => {
    const item = inventory.find((i) => i.productId === productId);
    return item?.availableQuantity ?? 0;
  };

  const adjust = async (productId: number, change: number) => {
   try {
      await adjustInventory(productId, change);
      await fetchData();
      setMessage('Inventory adjusted');
    } catch (error) {
      console.error('Failed to adjust inventory:', error);
      setMessage('Failed to adjust inventory');
    }
  };

  const handleSort = (key: 'name' | 'type' | 'size' | 'material' | 'available') => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const openEdit = (product: Product) => {
    setEditingProduct({ ...product, available: getQuantity(product.id) });
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
   try {
      const { available, ...prod } = editingProduct;
      await updateProduct(prod);
      const diff = available - getQuantity(editingProduct.id);
      if (diff !== 0) {
        await adjustInventory(editingProduct.id, diff);
      }
      setEditingProduct(null);
      setMessage('Product updated!');
      await fetchData();
    } catch (error) {
      console.error('Failed to update product:', error);
      setMessage('Failed to update product');
  } 

  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteProduct(deleteId);
      setDeleteId(null);
      setMessage('Product deleted!');
      await fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      setMessage('Failed to delete product');
    }
  };

  const rows = products.map((p) => ({ ...p, available: getQuantity(p.id) }));

  if (sortConfig) {
    rows.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }

  const totalPages = search ? 1 : Math.ceil(totalCount / pageSize) || 1;

  return (
    <>
      <div className="card shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="section-title text-primary mb-0">Product Inventory</h4>
      <div className="d-flex align-items-center gap-2">
          <div className = "search-bar d-flex align-items-center"   >
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AddProduct onAdd={handleProductAdded} />
        </div>
      </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered table-sm align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('name')}
                >
                  Name {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('type')}
                >
                  Type {sortConfig?.key === 'type' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('size')}
                >
                  Size {sortConfig?.key === 'size' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('material')}
                >
                  Material {sortConfig?.key === 'material' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('available')}
                >
                  Available {sortConfig?.key === 'available' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Adjust</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr
                  key={product.id}
                  className={product.available < 50 ? 'table-danger' : ''}
                >
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.type}</td>
                  <td>{product.size}</td>
                  <td>{product.material}</td>
                  <td>{product.available}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success me-1"
                      onClick={() => adjust(product.id, 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => adjust(product.id, -1)}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1 d-flex align-items-center rounded-pill"
                      onClick={() => openEdit(product)}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Edit
                    </button>
                    <button
                     className="btn btn-sm btn-outline-danger d-flex align-items-center rounded-pill"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!search && (
         <div className="text-center mt-3 d-flex justify-content-center align-items-center gap-2 flex-wrap">
            <button
              className="btn btn-primary"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
             className="btn btn-primary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="form-control d-inline-block w-auto"
            />
            <button
            className="btn btn-primary"
              onClick={() => {
                const p = Number(pageInput);
                if (!isNaN(p)) {
                  setPage(Math.min(totalPages, Math.max(1, p)));
                  setPageInput('');
                }
              }}
            >
              Go
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
          </div>
        )}
      </div>

      {editingProduct && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Product</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingProduct(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <input
                      className="form-control"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      value={editingProduct.type}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, type: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      value={editingProduct.size}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, size: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      value={editingProduct.material}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, material: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      type="number"
                      value={editingProduct.available}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          available: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingProduct(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveEdit}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {deleteId !== null && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Product</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDeleteId(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this product?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {message && <div style={toastStyle}>{message}</div>}
      </>
  );
};



const toastStyle: React.CSSProperties = {
  position: 'fixed',
  top: '1rem',
  right: '1rem',
  backgroundColor: '#333',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '4px',
};

export default ProductInventory;