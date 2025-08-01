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

export interface InventoryOperation {
  id: number;
  productId: number;
  quantityChange: number;
  timestamp: string;
}
export async function addProduct(product: Product): Promise<Product> {
  const res = await axios.post(`${API_BASE}/products`, product);
  return res.data;
}
export async function getProducts(): Promise<Product[]> {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
}

export async function getInventory(): Promise<InventoryStatus[]> {
  const res = await axios.get(`${API_BASE}/inventory/status`);
  return res.data;
}

export async function getLowStock(): Promise<InventoryStatus[]> {
  const res = await axios.get(`${API_BASE}/inventory/lowstock`);
  return res.data;
}       

export async function getInventoryOperations(): Promise<InventoryOperation[]> {
  const res = await axios.get(`${API_BASE}/inventory/operations`);
  return res.data;
}


export async function adjustInventory(productId: number, quantityChange: number) {
  const res = await axios.post(`${API_BASE}/inventory/adjust`, null, {
    params: { productId, quantityChange },
  });
  return res.data;
}
