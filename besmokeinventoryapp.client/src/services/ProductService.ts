import axios from 'axios';

const API_BASE = 'http://localhost:5050/api';

export interface Product {
  id: number;
  name: string;
  type: string;
  size: string;
  material: string;
}

export interface InventoryStatus {
  productId: number;
  availableQuantity: number;
}

export interface InventoryOperation {
  id?: number;
  productId: number;
  productName: string;
  quantityChange: number;
  timestamp: string;
}
export interface PagedQuery {
  page: number;
  pageSize: number;
}
export interface ProductQuery {
  page: number;
  pageSize: number;
  sortBy?: string;
  descending?: boolean;
}

export async function getProducts(): Promise<Product[]> {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
}

export async function getPagedProducts(query: ProductQuery): Promise<{ products: Product[]; totalCount: number }> {
  const res = await axios.get(`${API_BASE}/products/paged`, { params: query });
  return res.data;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const res = await axios.post(`${API_BASE}/products`, product);
  return res.data;
}

export async function updateProduct(product: Product): Promise<Product> {
  const res = await axios.put(`${API_BASE}/products/${product.id}`, product);
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await axios.delete(`${API_BASE}/products/${id}`);
}

export async function getInventory(): Promise<InventoryStatus[]> {
  const res = await axios.get(`${API_BASE}/inventory/status`);
  return res.data;
}

export async function adjustInventory(productId: number, quantityChange: number): Promise<void> {
  await axios.post(`${API_BASE}/inventory/adjust`, null, {
    params: { productId, quantityChange }
  });
}

export async function getInventoryOperations(): Promise<InventoryOperation[]> {
  const res = await axios.get(`${API_BASE}/inventory/operations`);
  return res.data;
}

export async function getPagedInventoryOperations(query: PagedQuery): Promise<{ operations: InventoryOperation[]; totalCount: number }> {
  const res = await axios.get(`${API_BASE}/inventory/operations/paged`, { params: query });
  return res.data;
}

export async function getLowStock(threshold = 50): Promise<InventoryStatus[]> {
  const res = await axios.get(`${API_BASE}/inventory/lowstock`, {
    params: { threshold }
  });
  return res.data;
}

export async function searchProducts(
 name?: string,
  type?: string,
  size?: string,
  material?: string,
  sortBy?: string,
  descending?: boolean
): Promise<Product[]> {
  const res = await axios.get(`${API_BASE}/products/search`, {
    params: { name, type, size, material, sortBy, descending }
  });
  return res.data;
}