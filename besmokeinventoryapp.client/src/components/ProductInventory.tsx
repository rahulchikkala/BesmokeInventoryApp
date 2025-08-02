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
  const [editingProduct, setEditingProduct] = useState<(Product & { available: number }) | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const query: ProductQuery = { page, pageSize };
      const [{ products, totalCount }, inventory] = await Promise.all([
        getPagedProducts(query),
        getInventory(),
      ]);
      setProducts(products);
      setInventory(inventory);
      setTotalCount(totalCount);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    await adjustInventory(productId, change);
    await fetchData();
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
    const { available, ...prod } = editingProduct;
    await updateProduct(prod);
    const diff = available - getQuantity(editingProduct.id);
    if (diff !== 0) {
      await adjustInventory(editingProduct.id, diff);
    }
    setEditingProduct(null);
    setMessage('Product updated!');
    await fetchData();
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    await deleteProduct(deleteId);
    setDeleteId(null);
    setMessage('Product deleted!');
    await fetchData();
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

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <>
      <div className="card shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="section-title text-primary mb-0">Product Inventory</h4>
        <AddProduct onAdd={fetchData} />
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
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => adjust(product.id, 1)}
                    >
                      ＋
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => adjust(product.id, -1)}
                    >
                      －
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => openEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteId(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-3">
          <button
            className="btn btn-primary me-2"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-primary ms-2"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {editingProduct && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Edit Product</h3>
            <label>
              Name
              <input
                style={inputStyle}
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
              />
            </label>
            <label>
              Type
              <input
                style={inputStyle}
                value={editingProduct.type}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, type: e.target.value })
                }
              />
            </label>
            <label>
              Size
              <input
                style={inputStyle}
                value={editingProduct.size}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, size: e.target.value })
                }
              />
            </label>
            <label>
              Material
              <input
                style={inputStyle}
                value={editingProduct.material}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, material: e.target.value })
                }
              />
            </label>
            <label>
              Available
              <input
                style={inputStyle}
                type="number"
                value={editingProduct.available}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    available: Number(e.target.value),
                  })
                }
              />
            </label>
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-primary me-2" onClick={saveEdit}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <p>Are you sure you want to delete this product?</p>
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-danger me-2" onClick={confirmDelete}>
                Delete
              </button>
               <button
                className="btn btn-secondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <div style={toastStyle}>{message}</div>}
      </>
  );
};



const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px',
  marginBottom: '0.5rem',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  width: '300px',
  maxWidth: '90%',
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
