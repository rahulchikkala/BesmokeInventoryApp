import React, { useEffect, useState } from 'react';
import type { InventoryStatus } from '/src/services/ProductService.ts';
import type { Product } from '/src/services/ProductService.ts';
import { getProducts, getInventory } from '/src/services/ProductService.ts';
import { adjustInventory } from '../services/ProductService';

const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);

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

  return (
    <div style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Product Inventory</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
        <thead>
          <tr style={{ backgroundColor: '#ddd' }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Size</th>
            <th style={thStyle}>Material</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Adjust</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => {
            const quantity = getQuantity(product.id);
            return (
              <tr
                key={product.id}
                style={{
                  backgroundColor: quantity < 50 ? '#ffe0e0' : 'white',
                  color: quantity < 50 ? '#b00000' : 'black',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <td style={tdStyle}>{product.name}</td>
                <td style={tdStyle}>{product.type}</td>
                <td style={tdStyle}>{product.size}</td>
                <td style={tdStyle}>{product.material}</td>
                <td style={tdStyle}>{quantity}</td>
                <td style={tdStyle}>
                  <button style={btnStyle} onClick={() => adjust(product.id, 1)}>＋</button>
                  <button style={btnStyle} onClick={() => adjust(product.id, -1)}>－</button>
                </td>
              </tr>
            );
          })}
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