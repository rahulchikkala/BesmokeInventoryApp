import axios from 'axios';

const API_BASE = 'http://localhost:5050/api';
function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    console.error('API error:', error.message);
    throw error;
  }
  throw error as Error;
}

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
  try {
    const res = await axios.get(`${API_BASE}/products`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getPagedProducts(query: ProductQuery): Promise<{ products: Product[]; totalCount: number }> {
  try {
    const res = await axios.get(`${API_BASE}/products/paged`, { params: query });
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

export async function addProduct(product: NewProduct): Promise<Product> {
  try {
    const res = await axios.post(`${API_BASE}/products`, product);
    return res.data;
  } catch (error) {
    handleError(error);
  }
}



export async function updateProduct(product: Product): Promise<void> {
 try {
    await axios.put(`${API_BASE}/products/${product.id}`, product);
  } catch (error) {
    handleError(error);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await axios.delete(`${API_BASE}/products/${id}`);
  } catch (error) {
    handleError(error);
  }
}

export async function getInventory(): Promise<InventoryStatus[]> {
 try {
    const res = await axios.get(`${API_BASE}/inventory/status`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

export async function adjustInventory(productId: number, quantityChange: number): Promise<void> {
 try {
    await axios.post(`${API_BASE}/inventory/adjust`, null, {
      params: { productId, quantityChange }
    });
  } catch (error) {
    handleError(error);
  }
}

export async function getInventoryOperations(startTime?: string, endTime?: string): Promise<InventoryOperation[]> {
 try {
    const res = await axios.get(`${API_BASE}/inventory/operations`, {
      params: { startTime, endTime }
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getPagedInventoryOperations(query: PagedQuery): Promise<{ operations: InventoryOperation[]; totalCount: number }> {
  try {
    const res = await axios.get(`${API_BASE}/inventory/operations/paged`, { params: query });
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getLowStock(threshold = 50): Promise<InventoryStatus[]> {
  try {
    const res = await axios.get(`${API_BASE}/inventory/lowstock`, {
      params: { threshold }
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

export async function searchProducts(
    id?: number,
 name?: string,
  type?: string,
  size?: string,
  material?: string,
  sortBy?: string,
  descending?: boolean
): Promise<Product[]> {
 try {
    const res = await axios.get(`${API_BASE}/products/search`, {
      params: { id, name, type, size, material, sortBy, descending }
    });
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return [];
    }
    handleError(err);
  }
}