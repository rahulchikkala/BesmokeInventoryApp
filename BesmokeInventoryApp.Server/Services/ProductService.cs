using BesmokeInventoryApp.Server.Data;
using BesmokeInventoryApp.Server.Dtos;
using BesmokeInventoryApp.Server.Mappers;
using BesmokeInventoryApp.Server.Models;
using Microsoft.EntityFrameworkCore;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly ApplicationDbContext _context;
    public ProductService(IProductRepository repo, ApplicationDbContext context)
    {
        _repo = repo;
        _context = context;
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

    public async Task<(bool Success, string Message)> CreateProduct(ProductDto productDto)
    {
        var product = new Product
        {
            Name = productDto.Name,
            Type = productDto.Type,
            Size = productDto.Size,
            Material = productDto.Material
        };

        if (await _repo.ExistsAsync(product))
            return (false, "Duplicate product");

        await _repo.AddAsync(product);

        var status = new InventoryStatus
        {
            ProductId = product.Id,
            AvailableQuantity = 0
        };
        await _context.InventoryStatuses.AddAsync(status);
        await _context.SaveChangesAsync();

        return (true, "Created");
    }

    public async Task<List<ProductDto>> SearchProductsAsync(
        string? name,
        string? type,
        string? size,
        string? material,
        string? sortBy = null,
        bool descending = false)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrEmpty(name))
            query = query.Where(p => p.Name != null &&
                p.Name.ToLower() == name.ToLower());
        if (!string.IsNullOrEmpty(type))
            query = query.Where(p => p.Type != null &&
                 p.Type.ToLower() == type.ToLower());
        if (!string.IsNullOrEmpty(size))
            query = query.Where(p => p.Size != null &&
                p.Size.ToLower() == size.ToLower());
        if (!string.IsNullOrEmpty(material))
            query = query.Where(p => p.Material != null &&
                p.Material.ToLower() == material.ToLower());
        if (!string.IsNullOrEmpty(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "name" => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
                "type" => descending ? query.OrderByDescending(p => p.Type) : query.OrderBy(p => p.Type),
                "size" => descending ? query.OrderByDescending(p => p.Size) : query.OrderBy(p => p.Size),
                "material" => descending ? query.OrderByDescending(p => p.Material) : query.OrderBy(p => p.Material),
                _ => query
            };
        }

        var products = await query.ToListAsync();

        return products.Select(ProductMapper.ToDto).ToList();

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
        var status = await _context.InventoryStatuses
            .FirstOrDefaultAsync(s => s.ProductId == id);
        if (status != null)
        {
            _context.InventoryStatuses.Remove(status);
        }
        await _repo.DeleteAsync(existing);
        return true;
    }

    public async Task<List<ProductDto>> GetProductsByTypeAsync(string type)
    {
        var products = await _repo.GetByTypeAsync(type);
        return products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name ?? "",
            Type = p.Type ?? "",
            Size = p.Size ?? "",
            Material = p.Material ?? ""
        }).ToList();
    }

    public async Task<(List<ProductDto>, int)> GetPagedProductsAsync(ProductQueryDto query)
    {
        var productsQuery = _context.Products.AsQueryable();

        if (!string.IsNullOrEmpty(query.SortBy))
        {
            productsQuery = query.SortBy.ToLower() switch
            {
                "name" => query.Descending ? productsQuery.OrderByDescending(p => p.Name) : productsQuery.OrderBy(p => p.Name),
                "type" => query.Descending ? productsQuery.OrderByDescending(p => p.Type) : productsQuery.OrderBy(p => p.Type),
                "size" => query.Descending ? productsQuery.OrderByDescending(p => p.Size) : productsQuery.OrderBy(p => p.Size),
                "material" => query.Descending ? productsQuery.OrderByDescending(p => p.Material) : productsQuery.OrderBy(p => p.Material),
                _ => productsQuery
            };
        }

        var totalCount = await productsQuery.CountAsync();
        var products = await productsQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name ?? "",
                Type = p.Type ?? "",
                Size = p.Size ?? "",
                Material = p.Material ?? ""
            })
            .ToListAsync();

        return (products, totalCount);
    }


}
