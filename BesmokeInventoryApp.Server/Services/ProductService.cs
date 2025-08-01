using BesmokeInventoryApp.Server.Dtos;
using BesmokeInventoryApp.Server.Mappers;
using BesmokeInventoryApp.Server.Models;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;

    public ProductService(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<ProductDto>> GetAllProductsAsync()
    {
        var products = await _repo.GetAllAsync();
        return products.Select(ProductMapper.ToDto).ToList();
    }

    public async Task<ProductDto?> GetProduct(int id)
    {
        var product = await _repo.GetByIdAsync(id);
        return product == null ? null : ProductMapper.ToDto(product);
    }

    public async Task<(bool Success, string Message)> CreateProduct(ProductDto dto)
    {
        var product = ProductMapper.ToEntity(dto);
        if (await _repo.ExistsAsync(product))
            return (false, "Duplicate product");

        await _repo.AddAsync(product);
        return (true, "Created");
    }

    public async Task<bool> UpdateProduct(ProductDto dto)
    {
        var existing = await _repo.GetByIdAsync(dto.Id);
        if (existing == null) return false;

        var updated = ProductMapper.ToEntity(dto);
        await _repo.UpdateAsync(updated);
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
