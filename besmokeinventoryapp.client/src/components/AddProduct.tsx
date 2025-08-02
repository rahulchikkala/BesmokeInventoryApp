import React, { useState } from 'react';
import { addProduct } from '../services/ProductService';

interface Props {
  onAdd?: () => void;
}

const AddProduct: React.FC<Props> = ({ onAdd }) => {
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
    
    } catch (error) {
      console.error(error);
       alert('Error adding product');
    }
  };

  return (
    <>
  <button
        className="btn btn-success d-inline-flex align-items-center rounded-pill"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-plus-circle me-1"></i>
        Add
      </button>
      {open && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Product</h5>
                  <button type="button" className="btn-close" onClick={() => setOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {(['name', 'type', 'size', 'material'] as Array<keyof typeof form>).map((field) => (
                      <div className="mb-3" key={field}>
                        <input
                          className="form-control"
                          name={field}
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
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
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};
export default AddProduct;
