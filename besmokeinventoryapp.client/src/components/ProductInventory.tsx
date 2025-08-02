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
    <div
      style={{
        backgroundColor: '#f7f7f7',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <AddProduct onAdd={fetchData} />
      <h2 style={{ textAlign: 'center' }}>Product Inventory</h2>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}
      >
        <thead>
          <tr style={{ backgroundColor: '#ddd' }}>
            <th style={thStyle}>ID</th>
            <th
              style={{ ...thStyle, cursor: 'pointer' }}
              onClick={() => handleSort('name')}
            >
              Name {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              style={{ ...thStyle, cursor: 'pointer' }}
              onClick={() => handleSort('type')}
            >
              Type {sortConfig?.key === 'type' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              style={{ ...thStyle, cursor: 'pointer' }}
              onClick={() => handleSort('size')}
            >
              Size {sortConfig?.key === 'size' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              style={{ ...thStyle, cursor: 'pointer' }}
              onClick={() => handleSort('material')}
            >
              Material {sortConfig?.key === 'material' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              style={{ ...thStyle, cursor: 'pointer' }}
              onClick={() => handleSort('available')}
            >
              Available {sortConfig?.key === 'available' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={thStyle}>Adjust</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((product) => (
            <tr
              key={product.id}
              style={{
                backgroundColor: product.available < 50 ? '#ffe0e0' : 'white',
                color: product.available < 50 ? '#b00000' : 'black',
                borderBottom: '1px solid #ccc',
              }}
            >
              <td style={tdStyle}>{product.id}</td>
              <td style={tdStyle}>{product.name}</td>
              <td style={tdStyle}>{product.type}</td>
              <td style={tdStyle}>{product.size}</td>
              <td style={tdStyle}>{product.material}</td>
              <td style={tdStyle}>{product.available}</td>
              <td style={tdStyle}>
                <button style={btnStyle} onClick={() => adjust(product.id, 1)}>
                  ＋
                </button>
                <button style={btnStyle} onClick={() => adjust(product.id, -1)}>
                  －
                </button>
              </td>
              <td style={tdStyle}>
                <button style={btnStyle} onClick={() => openEdit(product)}>
                  Edit
                </button>
                <button style={btnStyle} onClick={() => setDeleteId(product.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          style={btnStyle}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span style={{ margin: '0 1rem' }}>
          Page {page} of {totalPages}
        </span>
        <button
          style={btnStyle}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
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
              <button style={btnStyle} onClick={saveEdit}>
                Save
              </button>
              <button style={btnStyle} onClick={() => setEditingProduct(null)}>
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
              <button style={btnStyle} onClick={confirmDelete}>
                Delete
              </button>
              <button style={btnStyle} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <div style={toastStyle}>{message}</div>}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #eee',
  padding: '10px',
};

const btnStyle: React.CSSProperties = {
  margin: '0 5px',
  padding: '5px 10px',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '3px',
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
