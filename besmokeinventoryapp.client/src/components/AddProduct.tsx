import React, { useState } from 'react';
import { addProduct } from '../services/ProductService';

interface AddProductProps {
  onAdd?: () => void;
}

// A small button that opens a modal to add a product.
// This keeps the main inventory list as the primary focus.
const AddProduct: React.FC<AddProductProps> = ({ onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    type: '',
    size: '',
    material: '',
    initialQuantity: 0,
  });
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'initialQuantity' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct(form);
      setForm({ name: '', type: '', size: '', material: '', initialQuantity: 0 });
      await onAdd?.();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
        <button
          className="btn btn-success d-inline-flex align-items-center"
          onClick={() => setOpen(true)}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Add
        </button>
      {open && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h4 className="section-title text-primary">Add Product</h4>
            <form onSubmit={handleSubmit}>
              {(['name', 'type', 'size', 'material'] as const).map((field) => (
                <div className="mb-2" key={field}>
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
              <div className="mb-3">
                <input
                  className="form-control"
                  name="initialQuantity"
                  type="number"
                  placeholder="Initial Stock"
                  value={form.initialQuantity}
                  onChange={handleChange}
                />
              </div>
              <div className="text-end">
                <button type="submit" className="btn btn-primary me-2">
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
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

export default AddProduct;
