import React, { useState, useEffect, useCallback } from 'react';

import ExpandableCell from './ExpandableCell';
import type {
  InventoryStatus,
  Product,
  ProductQuery,
} from '../services/ProductService';
import {
  getPagedProducts,
  getInventory,
  adjustInventory,
  updateProduct,
  deleteProduct,
  searchProducts,
  addProduct,
} from '../services/ProductService';

interface Props {
  highlightId?: number | null;
  onHighlightDone?: () => void;
}

const ProductInventory: React.FC<Props> = ({ highlightId, onHighlightDone }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [sortConfig, setSortConfig] = useState<
    { key: 'id' | 'name' | 'type' | 'size' | 'material' | 'available'; direction: 'asc' | 'desc' } | null
  >(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<(Product & { available: number }) | null>(null);
  const [newProduct, setNewProduct] = useState<
    | {
        name: string;
        type: string;
        size: string;
        material: string;
        initialQuantity: number;
      }
    | null
  >(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState('');
  const fetchData = useCallback(async () => {
    try {
if (search) {
        const id = parseInt(search, 10);
        const [products, inventory] = await Promise.all([
         searchProducts(!isNaN(id) ? id : undefined, !isNaN(id) ? undefined : search),
          getInventory(),
        ]);
        setProducts(products);
        setInventory(inventory);
        setTotalCount(products.length);
      } else {
        const query: ProductQuery = { page, pageSize };
        const [{ products, totalCount }, inventory] = await Promise.all([
          getPagedProducts(query),
          getInventory(),
        ]);
        setProducts(products);
        setInventory(inventory);
        setTotalCount(totalCount);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('Error loading data');
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(1);
  }, [search]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    if (highlightId != null) {
      setSearch(highlightId.toString());
      setPage(1);
    }
  }, [highlightId]);
  useEffect(() => {
    if (highlightId != null) {
      const row = document.getElementById(`product-${highlightId}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('table-warning');
        setTimeout(() => row.classList.remove('table-warning'), 2000);
            onHighlightDone?.();
      }
  
    }
  }, [highlightId, products, inventory, onHighlightDone]);
  const getQuantity = (productId: number) => {
    const item = inventory.find((i) => i.productId === productId);
    return item?.availableQuantity ?? 0;
  };

  const adjust = async (productId: number, change: number) => {
   try {
      await adjustInventory(productId, change);
      await fetchData();
      setMessage('Inventory adjusted');
    } catch (error) {
      console.error('Failed to adjust inventory:', error);
      setMessage('Failed to adjust inventory');
    }
  };

  const handleSort = (key: 'id' | 'name' | 'type' | 'size' | 'material' | 'available') => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };
  const getSortIcon = (
    key: 'id' | 'name' | 'type' | 'size' | 'material' | 'available',
  ) => {
    if (!sortConfig || sortConfig.key !== key) return 'bi-chevron-expand';
    return sortConfig.direction === 'asc'
      ? 'bi-chevron-up'
      : 'bi-chevron-down';
  };
  const openEdit = (product: Product) => {
    setEditingProduct({ ...product, available: getQuantity(product.id) });
  };

const saveEdit = async () => {
    if (!editingProduct) return;
   try {
      const { available, ...prod } = editingProduct;
      await updateProduct(prod);
      const diff = available - getQuantity(editingProduct.id);
      if (diff !== 0) {
        await adjustInventory(editingProduct.id, diff);
      }
      setEditingProduct(null);
      setMessage('Product updated!');
      await fetchData();
    } catch (error) {
      console.error('Failed to update product:', error);
      setMessage('Failed to update product');
}
  };

  const saveNew = async () => {
    if (!newProduct) return;
    try {
      await addProduct(newProduct);
      setNewProduct(null);
      setMessage('Product added!');
      await fetchData();
    } catch (error) {
      console.error('Failed to add product:', error);
      setMessage('Failed to add product');
    }

  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteProduct(deleteId);
      setDeleteId(null);
      setMessage('Product deleted!');
      await fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      setMessage('Failed to delete product');
    }
  };

  const rows = products.map((p) => ({ ...p, available: getQuantity(p.id) }));

  if (sortConfig) {
    rows.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }

  const totalPages = search ? 1 : Math.ceil(totalCount / pageSize) || 1;

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <h4 className="section-title text-primary mb-0 flex-grow-1 text-center text-md-start">
              Product Inventory
            </h4>
            <div className="search-bar d-flex align-items-center">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
           {!newProduct && (
              <button
                className="btn btn-success d-inline-flex align-items-center rounded-pill"
                onClick={() =>
                  setNewProduct({
                    name: '',
                    type: '',
                    size: '',
                    material: '',
                    initialQuantity: 0,
                  })
                }
              >
                <i className="bi bi-plus-circle me-1"></i>
                Add
              </button>
            )}
          </div>
        </div>
        <div className="card-body p-0">
          {search && rows.length === 0 ? (
            <p className="text-center my-3">No results found.</p>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="table table-striped table-hover table-bordered table-sm align-middle text-center slim-table">
                <thead className="table-light sticky-top" style={{ top: 0 }}>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('id')}>
                      ID <i className={`bi ${getSortIcon('id')}`}></i>
                    </th>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      Name <i className={`bi ${getSortIcon('name')}`}></i>
                    </th>
                    <th className="sortable" onClick={() => handleSort('type')}>
                      Type <i className={`bi ${getSortIcon('type')}`}></i>
                    </th>
                    <th className="sortable" onClick={() => handleSort('size')}>
                      Size <i className={`bi ${getSortIcon('size')}`}></i>
                    </th>
                    <th className="sortable" onClick={() => handleSort('material')}>
                      Material <i className={`bi ${getSortIcon('material')}`}></i>
                    </th>
                    <th className="sortable" onClick={() => handleSort('available')}>
                      Available <i className={`bi ${getSortIcon('available')}`}></i>
                    </th>
                    <th>Adjust</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newProduct && (
                    <tr>
                      <td>
                       <input
                          className="form-control form-control-sm"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, name: e.target.value })
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={newProduct.type}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, type: e.target.value })
                          }
                          required
                        />
                      </td>
                      <td>
                       <input
                          className="form-control form-control-sm"
                          value={newProduct.size}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, size: e.target.value })
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={newProduct.material}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              material: e.target.value,
                            })
                          }
                          required
                        />
                      </td>
                   
                      <td>
                       <input
                          className="form-control form-control-sm"
                          type="number"
                          value={newProduct.initialQuantity}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              initialQuantity: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={saveNew}
                          >
                            Add
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setNewProduct(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
)}
                  {rows.map((product) => {
                    const isEditing = editingProduct?.id === product.id;
                    return isEditing ? (
                      <tr
                        key={product.id}
                        id={`product-${product.id}`}
                        className={product.available < 50 ? 'table-danger' : ''}
                      >
                        <td>{product.id}</td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={editingProduct!.name}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct!,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={editingProduct!.type}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct!,
                                type: e.target.value,
                              })
                            }
                            required
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={editingProduct!.size}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct!,
                                size: e.target.value,
                              })
                            }
                            required
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={editingProduct!.material}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct!,
                                material: e.target.value,
                              })
                            }
                            required
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            value={editingProduct!.available}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct!,
                                available: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td>-</td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={saveEdit}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => setEditingProduct(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={product.id}
                        id={`product-${product.id}`}
                        className={product.available < 50 ? 'table-danger' : ''}
                      >
                        <td>{product.id}</td>
                        <td>
                          <ExpandableCell text={product.name} maxWidth={150} />
                        </td>
                        <td>
                          <ExpandableCell text={product.type} maxWidth={120} />
                        </td>
                        <td>
                          <ExpandableCell text={product.size} maxWidth={120} />
                        </td>
                        <td>
                          <ExpandableCell text={product.material} maxWidth={120} />
                        </td>
                        <td>{product.available}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-success me-1 icon-btn"
                            onClick={() => adjust(product.id, 1)}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger icon-btn"
                            onClick={() => adjust(product.id, -1)}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1 icon-btn"
                            onClick={() => openEdit(product)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger icon-btn"
                            onClick={() => setDeleteId(product.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!search && (
          <div className="card-footer d-flex justify-content-center align-items-center gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
              className="form-control form-control-sm w-auto"
            />
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                const p = Number(pageInput);
                if (!pageInput || isNaN(p) || p < 1 || p > totalPages) {
                  setMessage('Page not found');
                } else {
                  setPage(p);
                }
                setPageInput('');
              }}
            >
              Go
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
          </div>
        )}
      </div>


      {deleteId !== null && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Product</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDeleteId(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this product?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
        </>
      )}

      {message && <div style={toastStyle}>{message}</div>}
    </>
  );
};

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  top: '1rem',
  right: '1rem',
  backgroundColor: '#333',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '4px',
  zIndex: 2000,
};

export default ProductInventory;