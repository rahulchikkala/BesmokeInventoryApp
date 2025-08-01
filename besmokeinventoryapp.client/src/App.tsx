import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductInventory from "./components/ProductInventory";

function App() {
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Inventory Dashboard</h1>
      <ProductInventory />
    </div>
  );
}

export default App;
