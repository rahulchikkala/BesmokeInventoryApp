import React, { useEffect, useState, useCallback } from 'react';
import {
  getPagedProducts,
  getInventory,
  deleteProduct,
  updateProduct,
  adjustInventory,
  addProduct,

} from '../services/ProductService';
import type { Product, InventoryStatus, ProductQuery } from '../services/ProductService';

const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAll = useCallback(async () => {
    const query: ProductQuery = {
      page,
      pageSize,
      sortBy: sortKey,
      descending: !sortAsc
    };

    const [{ products: prods, totalCount }, inv] = await Promise.all([
      getPagedProducts(query),
      getInventory(),

    ]);
    setProducts(prods);
    setTotalCount(totalCount);
    setInventory(inv);

    setError(null);
  }, [page, pageSize, sortKey, sortAsc]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const getQuantity = (productId: number) =>
    inventory.find(i => i.productId === productId)?.availableQuantity ?? 0;

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    await fetchAll();
  };

  const handleAdjust = async (id: number, delta: number) => {
    await adjustInventory(id, delta);
    await fetchAll();
    };
  const handleSort = (key: keyof Product) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(1);
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
    };

    const duplicate = products.find(p =>
      p.id !== editProduct.id &&
      p.name === editProduct.name &&
      p.type === editProduct.type &&
      p.size === editProduct.size &&
      p.material === editProduct.material
    );

    if (duplicate) {
      setError('Duplicate product exists.');
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
      await fetchAll();
    } catch {
      setError('Update failed.');
    }
  };

  const handleNewProductChange = (key: keyof Product, value: string) => {
    setNewProduct(prev => ({ ...prev, [key]: value }));
  };

async function handleAddProduct() {
    if (!newProduct.name || !newProduct.type || !newProduct.size || !newProduct.material) {
      setError('All fields are required for new product.');
      return;
    }

    const duplicate = products.find(p =>
      p.name === newProduct.name &&
      p.type === newProduct.type &&
      p.size === newProduct.size &&
      p.material === newProduct.material
    );

    if (duplicate) {
      setError('Duplicate product cannot be added.');
      return;
    }

    try {
      await addProduct(newProduct as Product);
      setNewProduct({});
      await fetchAll();
    } catch {
      setError('Failed to add product.');
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Product Inventory</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-3">
        <div className="col">
          <input
            placeholder="Name"
            className="form-control form-control-sm"
            value={newProduct.name || ''}
            onChange={e => handleNewProductChange('name', e.target.value)}
          />
        </div>
        <div className="col">
          <input
            placeholder="Type"
            className="form-control form-control-sm"
            value={newProduct.type || ''}
            onChange={e => handleNewProductChange('type', e.target.value)}
          />
        </div>
        <div className="col">
          <input
            placeholder="Size"
            className="form-control form-control-sm"
            value={newProduct.size || ''}
            onChange={e => handleNewProductChange('size', e.target.value)}
          />
        </div>
        <div className="col">
          <input
            placeholder="Material"
            className="form-control form-control-sm"
            value={newProduct.material || ''}
            onChange={e => handleNewProductChange('material', e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-sm btn-success" onClick={handleAddProduct}>Add</button>
        </div>
      </div>

      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr>
          <th>ID</th>
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
          {products.map(p => (
            <tr key={p.id}>
              {editingId === p.id ? (
                <>
                <td>{p.id}</td>
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
                <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.type}</td>
                  <td>{p.size}</td>
                  <td>{p.material}</td>
                  <td>{getQuantity(p.id)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleAdjust(p.id, +1)}>+</button>
                    <button className="btn btn-sm btn-outline-danger me-1" onClick={() => handleAdjust(p.id, -1)}>-</button>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditClick(p)}>Edit</button>
                    <button className="btn btn-sm btn-outline-dark" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between align-items-center my-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(totalCount / pageSize) || 1}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.ceil(totalCount / pageSize)}
        >
          Next
        </button>
      </div>

     
    </div>
  );
};

export default ProductInventory;
