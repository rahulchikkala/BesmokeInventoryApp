import React, { useEffect, useState } from 'react';
import type { InventoryStatus, Product } from '../services/ProductService';
import {
  getProducts,
  getInventory,
  adjustInventory,
  updateProduct,
  deleteProduct,
} from '../services/ProductService';

const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [sortConfig, setSortConfig] = useState<
    { key: 'type' | 'size' | 'material' | 'available'; direction: 'asc' | 'desc' } | null
  >(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();
        const inventory = await getInventory();
        setProducts(products);
        setInventory(inventory);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    fetchData();
  }, []);

  const getQuantity = (productId: number) => {
    const item = inventory.find(i => i.productId === productId);
    return item?.availableQuantity ?? 0;
  };

  const adjust = async (productId: number, change: number) => {
    await adjustInventory(productId, change);
    const updatedInventory = await getInventory();
    setInventory(updatedInventory);
  };

  const handleSort = (key: 'type' | 'size' | 'material' | 'available') => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const edit = async (product: Product) => {
    const name = prompt('Name', product.name);
    if (name === null) return;
    const type = prompt('Type', product.type);
    if (type === null) return;
    const size = prompt('Size', product.size);
    if (size === null) return;
    const material = prompt('Material', product.material);
    if (material === null) return;
    await updateProduct({ ...product, name, type, size, material });
    alert('Product updated!');
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
  };

  const remove = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      alert('Product deleted!');
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
      const updatedInventory = await getInventory();
      setInventory(updatedInventory);
    }
  };

  const rows = products.map(p => ({ ...p, available: getQuantity(p.id) }));

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

  return (
    <div style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Product Inventory</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
        <thead>
          <tr style={{ backgroundColor: '#ddd' }}>
            <th style={thStyle}>Name</th>
            <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('type')}>Type</th>
            <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('size')}>Size</th>
            <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('material')}>Material</th>
            <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('available')}>Available</th>
            <th style={thStyle}>Adjust</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(product => (
            <tr
              key={product.id}
              style={{
                backgroundColor: product.available < 50 ? '#ffe0e0' : 'white',
                color: product.available < 50 ? '#b00000' : 'black',
                borderBottom: '1px solid #ccc',
              }}
            >
              <td style={tdStyle}>{product.name}</td>
              <td style={tdStyle}>{product.type}</td>
              <td style={tdStyle}>{product.size}</td>
              <td style={tdStyle}>{product.material}</td>
              <td style={tdStyle}>{product.available}</td>
              <td style={tdStyle}>
                <button style={btnStyle} onClick={() => adjust(product.id, 1)}>＋</button>
                <button style={btnStyle} onClick={() => adjust(product.id, -1)}>－</button>
              </td>
              <td style={tdStyle}>
                <button style={btnStyle} onClick={() => edit(product)}>Edit</button>
                <button style={btnStyle} onClick={() => remove(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default ProductInventory;