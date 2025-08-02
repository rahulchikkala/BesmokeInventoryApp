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
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="section-title text-primary">Add Product</h4>
      <form onSubmit={handleSubmit} className="row g-2 align-items-end">
        {(['name', 'type', 'size', 'material'] as const).map((field) => (
          <div className="col-sm" key={field}>
            <input
              className="form-control"
              name={field}
              placeholder={field}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <div className="col-sm">
          <input
            className="form-control"
            name="initialQuantity"
            type="number"
            placeholder="Initial Stock"
            value={form.initialQuantity}
            onChange={handleChange}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-primary w-100">
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
