import React, { useState } from 'react';
import { searchProducts } from '../services/ProductService';
import type { Product } from '../services/ProductService';

const ProductSearch: React.FC = () => {
  const [term, setTerm] = useState('');
  const [typeTerm, setTypeTerm] = useState('');
  const [sizeTerm, setSizeTerm] = useState('');
  const [materialTerm, setMaterialTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = async (
    sort: keyof Product = sortKey,
    asc: boolean = sortAsc
  ) => {
    try {
      const data = await searchProducts(term, typeTerm, sizeTerm, materialTerm, sort, !asc);
      setResults(data);
      setError(null);
    } catch {
      setError('Search failed');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadResults();
  };

  const handleSort = async (key: keyof Product) => {
    const asc = key === sortKey ? !sortAsc : true;
    setSortKey(key);
    setSortAsc(asc);
    await loadResults(key, asc);
  };

  return (
    <div className="card p-3">
      <h4 className="mb-3">Search Products</h4>
      <form onSubmit={handleSearch} className="row g-2 mb-3">
        <div className="col">
          <input
            className="form-control"
            placeholder="Name"
            value={term}
            onChange={e => setTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Type"
            value={typeTerm}
            onChange={e => setTypeTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Size"
            value={sizeTerm}
            onChange={e => setSizeTerm(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Material"
            value={materialTerm}
            onChange={e => setMaterialTerm(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      {results.length > 0 && (
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortKey === 'name' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('type')}>
                Type {sortKey === 'type' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('size')}>
                Size {sortKey === 'size' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('material')}>
                Material {sortKey === 'material' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.type}</td>
                <td>{p.size}</td>
                <td>{p.material}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductSearch;