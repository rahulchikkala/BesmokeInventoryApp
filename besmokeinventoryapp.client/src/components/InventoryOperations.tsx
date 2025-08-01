import React from "react";

const InventoryOperations: React.FC = () => (
  <div className="mb-3 d-flex justify-content-end">
    <button className="btn btn-success" onClick={handleAddProduct}>Add</button>
<button className="btn btn-danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>

  </div>
);

export default InventoryOperations;
