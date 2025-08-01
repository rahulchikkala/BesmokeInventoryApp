import React, { useState } from 'react';
import { addProduct } from '../services/ProductService';

const AddProduct: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    type: '',
    size: '',
    material: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct(form);
    setForm({ name: '', type: '', size: '', material: '' });
  };

  return (
    <div className="card p-3 mb-4">
      <h4>Add New Product</h4>
      <form onSubmit={handleSubmit} className="row g-2">
        <div className="col-md-3">
          <input className="form-control" placeholder="Name" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Type" name="type" value={form.type} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input className="form-control" placeholder="Size" name="size" value={form.size} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input className="form-control" placeholder="Material" name="material" value={form.material} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" type="submit">Add</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
