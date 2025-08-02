import React, { useState, useEffect } from 'react';
import {
  searchProducts,
  getInventory,
  deleteProduct,
  updateProduct,
  adjustInventory,
} from '../services/ProductService';
import type { Product, InventoryStatus } from '../services/ProductService';
const ProductSearch: React.FC = () => {
  const [term, setTerm] = useState('');
  const [typeTerm, setTypeTerm] = useState('');
  const [sizeTerm, setSizeTerm] = useState('');
  const [materialTerm, setMaterialTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { available: number }) | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const loadResults = async (sort: keyof Product = sortKey, asc: boolean = sortAsc) => {
    try {
      const [data, inv] = await Promise.all([
        searchProducts(term, typeTerm, sizeTerm, materialTerm, sort, !asc),
        getInventory(),
      ]);
      setResults(data);
      setInventory(inv);
      setSearched(true);
      setError(null);
    } catch {
      setError('Search failed');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadResults();
  };

  const handleSort = async (key: keyof Product) => {
    const asc = key === sortKey ? !sortAsc : true;
    setSortKey(key);
    setSortAsc(asc);
    await loadResults(key, asc);
  };
  const getQuantity = (productId: number) =>
    inventory.find((i) => i.productId === productId)?.availableQuantity ?? 0;

  const adjust = async (id: number, delta: number) => {
    await adjustInventory(id, delta);
    await loadResults();
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
    await loadResults();
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    await deleteProduct(deleteId);
    setDeleteId(null);
    setMessage('Product deleted!');
    await loadResults();
  };
  return (
    <div className="card shadow-sm p-4">
      <h4 className="section-title text-primary">Search Products</h4>
      <form onSubmit={handleSearch} className="row g-2 mb-3">
        <div className="col">
          <input
            className="form-control"
            placeholder="Name"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Type"
            value={typeTerm}
           onChange={(e) => setTypeTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Size"
            value={sizeTerm}
            onChange={(e) => setSizeTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Material"
            value={materialTerm}
             onChange={(e) => setMaterialTerm(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      {searched && results.length === 0 && !error && (
        <div className="alert alert-warning">No products found</div>
      )}
      {results.length > 0 && (
        <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered table-sm align-middle">
            <thead className="table-light">
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Name {sortKey === 'name' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                  Type {sortKey === 'type' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('size')} style={{ cursor: 'pointer' }}>
                  Size {sortKey === 'size' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('material')} style={{ cursor: 'pointer' }}>
                  Material {sortKey === 'material' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th>Stock</th>
                <th>Adjust</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.type}</td>
                  <td>{p.size}</td>
                  <td>{p.material}</td>
                  <td>{getQuantity(p.id)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => adjust(p.id, 1)}
                    >
                      ＋
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => adjust(p.id, -1)}
                    >
                      －
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteId(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
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

export default ProductSearch;