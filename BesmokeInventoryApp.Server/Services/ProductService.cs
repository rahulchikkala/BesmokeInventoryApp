using BesmokeInventoryApp.Server.Models;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;

    public ProductService(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<Product>> GetAllProducts() => await _repo.GetAllAsync();

    public async Task<Product?> GetProduct(int id) => await _repo.GetByIdAsync(id);

    public async Task<(bool Success, string Message)> CreateProduct(Product product)
    {
        if (await _repo.ExistsAsync(product))
            return (false, "Duplicate product");

        await _repo.AddAsync(product);
        return (true, "Created");
    }

    public async Task<bool> UpdateProduct(Product product)
    {
        var existing = await _repo.GetByIdAsync(product.Id);
        if (existing == null) return false;

        await _repo.UpdateAsync(product);
        return true;
    }

    public async Task<bool> DeleteProduct(int id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        await _repo.DeleteAsync(existing);
        return true;
    }
}
