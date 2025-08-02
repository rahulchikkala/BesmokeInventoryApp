import React, { useState } from 'react';
import {
  searchProducts,
  getInventory,
  deleteProduct,
  updateProduct,
  adjustInventory
} from '../services/ProductService';
import type { Product, InventoryStatus } from '../services/ProductService';
const ProductSearch: React.FC = () => {
  const [term, setTerm] = useState('');
  const [typeTerm, setTypeTerm] = useState('');
  const [sizeTerm, setSizeTerm] = useState('');
  const [materialTerm, setMaterialTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const loadResults = async (
    sort: keyof Product = sortKey,
    asc: boolean = sortAsc
  ) => {
    try {
      const [data, inv] = await Promise.all([
        searchProducts(term, typeTerm, sizeTerm, materialTerm, sort, !asc),
        getInventory()
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
    inventory.find(i => i.productId === productId)?.availableQuantity ?? 0;

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    await loadResults();
  };

  const handleAdjust = async (id: number, delta: number) => {
    await adjustInventory(id, delta);
    await loadResults();
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setEditProduct({ ...product });
    setEditQuantity(getQuantity(product.id));
    setError(null);
  };

  const handleEditChange = (key: keyof Product, value: string) => {
    setEditProduct(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editProduct.id || !editProduct.name || !editProduct.type || !editProduct.size || !editProduct.material) {
      setError('All fields are required.');
      return;
    }

    try {
      await updateProduct(editProduct as Product);
      const currentQty = getQuantity(editProduct.id);
      if (editProduct.id && editQuantity !== currentQty) {
        await adjustInventory(editProduct.id, editQuantity - currentQty);
      }
      setEditingId(null);
      setEditProduct({});
      setEditQuantity(0);
      await loadResults();
    } catch {
      setError('Update failed');
    }
  };

  return (
    <div className="card p-3">
      <h4 className="mb-3">Search Products</h4>
      <form onSubmit={handleSearch} className="row g-2 mb-3">
        <div className="col">
          <input
            className="form-control"
            placeholder="Name"
            value={term}
            onChange={e => setTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Type"
            value={typeTerm}
            onChange={e => setTypeTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Size"
            value={sizeTerm}
            onChange={e => setSizeTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Material"
            value={materialTerm}
            onChange={e => setMaterialTerm(e.target.value)}
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
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortKey === 'name' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('type')}>
                Type {sortKey === 'type' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('size')}>
                Size {sortKey === 'size' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('material')}>
                Material {sortKey === 'material' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map(p => (
              <tr key={p.id}>
              {editingId === p.id ? (
                  <>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={editProduct.name || ''}
                        onChange={e => handleEditChange('name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={editProduct.type || ''}
                        onChange={e => handleEditChange('type', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={editProduct.size || ''}
                        onChange={e => handleEditChange('size', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={editProduct.material || ''}
                        onChange={e => handleEditChange('material', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editQuantity}
                        onChange={e => setEditQuantity(parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <button className="btn btn-sm btn-success me-1" onClick={handleSaveEdit}>Save</button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setEditingId(null);
                          setEditProduct({});
                          setEditQuantity(0);
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{p.name}</td>
                    <td>{p.type}</td>
                    <td>{p.size}</td>
                    <td>{p.material}</td>
                    <td>{getQuantity(p.id)}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button className="btn btn-outline-success" onClick={() => handleAdjust(p.id, 1)}>
                          <i className="bi bi-plus"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleAdjust(p.id, -1)}>
                          <i className="bi bi-dash"></i>
                        </button>
                        <button className="btn btn-outline-primary" onClick={() => handleEditClick(p)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-dark" onClick={() => handleDelete(p.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductSearch;