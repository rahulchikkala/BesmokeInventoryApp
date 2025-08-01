import React, { useEffect, useState } from 'react';
import {
  getProducts, getInventory, deleteProduct, updateProduct,
  adjustInventory, addProduct, getInventoryOperations
} from '../services/ProductService';
import type { Product, InventoryStatus, InventoryOperation } from '../services/ProductService';

const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [operations, setOperations] = useState<InventoryOperation[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [prods, inv, ops] = await Promise.all([
      getProducts(),
      getInventory(),
      getInventoryOperations()
    ]);
    setProducts(prods);
    setInventory(inv);
    setOperations(ops);
    setError(null);
  };

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
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setEditProduct({ ...product });
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
      setEditingId(null);
      setEditProduct({});
      fetchAll();
    } catch {
      setError('Update failed.');
    }
  };

  const handleNewProductChange = (key: keyof Product, value: string) => {
    setNewProduct(prev => ({ ...prev, [key]: value }));
  };

  const handleAddProduct = async () => {
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
      fetchAll();
    } catch {
      setError('Failed to add product.');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Product Inventory</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-3">
        <div className="col">
          <input placeholder="Name" className="form-control form-control-sm"
            value={newProduct.name || ''} onChange={e => handleNewProductChange('name', e.target.value)} />
        </div>
        <div className="col">
          <input placeholder="Type" className="form-control form-control-sm"
            value={newProduct.type || ''} onChange={e => handleNewProductChange('type', e.target.value)} />
        </div>
        <div className="col">
          <input placeholder="Size" className="form-control form-control-sm"
            value={newProduct.size || ''} onChange={e => handleNewProductChange('size', e.target.value)} />
        </div>
        <div className="col">
          <input placeholder="Material" className="form-control form-control-sm"
            value={newProduct.material || ''} onChange={e => handleNewProductChange('material', e.target.value)} />
        </div>
        <div className="col-auto">
          <button className="btn btn-sm btn-success" onClick={handleAddProduct}>Add</button>
        </div>
      </div>

      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('type')}>Type</th>
            <th onClick={() => handleSort('size')}>Size</th>
            <th onClick={() => handleSort('material')}>Material</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map(p => (
            <tr key={p.id}>
              {editingId === p.id ? (
                <>
                  <td><input className="form-control form-control-sm" value={editProduct.name || ''} onChange={e => handleEditChange('name', e.target.value)} /></td>
                  <td><input className="form-control form-control-sm" value={editProduct.type || ''} onChange={e => handleEditChange('type', e.target.value)} /></td>
                  <td><input className="form-control form-control-sm" value={editProduct.size || ''} onChange={e => handleEditChange('size', e.target.value)} /></td>
                  <td><input className="form-control form-control-sm" value={editProduct.material || ''} onChange={e => handleEditChange('material', e.target.value)} /></td>
                  
