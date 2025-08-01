import React, { useEffect, useState } from 'react';
import type { InventoryStatus } from '/src/services/ProductService.ts';
import type { Product } from '/src/services/ProductService.ts';
import { getProducts, getInventory } from '/src/services/ProductService.ts';

const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();
      const inventory = await getInventory();
      setProducts(products);
      setInventory(inventory);
    };

    fetchData();
  }, []);

  const getQuantity = (productId: number) => {
    const item = inventory.find(i => i.productId === productId);
    return item?.availableQuantity ?? 0;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Product Inventory</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Material</th>
            <th>Stock</th>
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
                  color: quantity < 50 ? 'red' : 'black',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <td>{product.name}</td>
                <td>{product.type}</td>
                <td>{product.size}</td>
                <td>{product.material}</td>
                <td>{quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductInventory;
