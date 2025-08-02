import axios from 'axios';

const API_BASE = 'http://localhost:5050/api';

export interface Product {
  id: number;
  name: string;
  type: string;
  size: string;
  material: string;
}

export interface NewProduct extends Omit<Product, 'id'> {
  initialQuantity: number;
}

export interface InventoryStatus {
  productId: number;
  availableQuantity: number;
}

export interface InventoryOperation {
  id?: number;
  productId: number;
  productName: string;
  productType: string;
  size: string;
  material: string;
  quantityChange: number;
  availableQuantity: number;
  operationType: string;
  changeDescription?: string;
  timestamp: string;
}
export interface PagedQuery {
  page: number;
  pageSize: number;
  startTime?: string;
  endTime?: string;
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

export async function addProduct(product: NewProduct): Promise<Product> {
  const res = await axios.post(`${API_BASE}/products`, product);
  return res.data;
}



export async function updateProduct(product: Product): Promise<void> {
  await axios.put(`${API_BASE}/products/${product.id}`, product);
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

export async function getInventoryOperations(startTime?: string, endTime?: string): Promise<InventoryOperation[]> {
  const res = await axios.get(`${API_BASE}/inventory/operations`, { params: { startTime, endTime } });
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
 try {
    const res = await axios.get(`${API_BASE}/products/search`, {
      params: { name, type, size, material, sortBy, descending }
    });
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return [];
    }
    throw err;
  }
}