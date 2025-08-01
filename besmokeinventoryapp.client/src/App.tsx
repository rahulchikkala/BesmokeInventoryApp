import 'bootstrap/dist/css/bootstrap.min.css';
import ProductInventory from './components/ProductInventory';
import LowStockAlert from './components/LowStockAlert';
import InventoryOperations from './components/InventoryOperations';


function App() {
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Inventory Dashboard</h1>
      <LowStockAlert />
      <ProductInventory />
      <InventoryOperations />
    </div>
  );
}

export default App;