import axios from 'axios';
const API_BASE = 'http://localhost:5271/api';


export interface Product {
  id: number;
  name: string;
  type: string;
  size: string;
  material: string;
}

export interface InventoryStatus {
  id: number;
  productId: number;
  availableQuantity: number;    
}

export async function getProducts(): Promise<Product[]> {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
}

export async function getInventory(): Promise<InventoryStatus[]> {
  const res = await axios.get(`${API_BASE}/inventory/status`);
  return res.data;
}

export async function adjustInventory(productId: number, quantityChange: number) {
  const res = await axios.post(`${API_BASE}/inventory/adjust`, null, {
    params: { productId, quantityChange },
  });
  return res.data;
}
