import React, { useState } from 'react';
import { addProduct } from '../services/ProductService';

interface AddProductProps {
  onAdd?: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    type: '',
    size: '',
    material: '',
    initialQuantity: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'initialQuantity' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct(form);
      alert('Product added!');
      setForm({ name: '', type: '', size: '', material: '', initialQuantity: 0 });
      onAdd?.();
    } catch (error) {
      console.error(error);
      alert('Error adding product');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3>Add Product</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {(['name', 'type', 'size', 'material'] as const).map(field => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            required
            style={{ padding: '0.5rem', flex: '1' }}
          />
        ))}
        <input
          name="initialQuantity"
          type="number"
          placeholder="Initial Stock"
          value={form.initialQuantity}
          onChange={handleChange}
          style={{ padding: '0.5rem', flex: '1' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Add</button>
      </div>
    </form>
  );
};

export default AddProduct;
