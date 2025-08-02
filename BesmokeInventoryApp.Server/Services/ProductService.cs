using BesmokeInventoryApp.Server.Data;
using BesmokeInventoryApp.Server.Dtos;
using BesmokeInventoryApp.Server.Mappers;
using BesmokeInventoryApp.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly ApplicationDbContext _context;
    private readonly IInventoryRepository _inventoryRepo;
    public ProductService(IProductRepository repo, ApplicationDbContext context, IInventoryRepository inventoryRepo)
    {
        _repo = repo;
        _context = context;
        _inventoryRepo = inventoryRepo;
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

        var initialQty = productDto.InitialQuantity;
        var status = new InventoryStatus
        {
            ProductId = product.Id,
            AvailableQuantity = initialQty
        };
        await _context.InventoryStatuses.AddAsync(status);
        await _inventoryRepo.AddOperationAsync(new InventoryOperation
        {
            ProductId = product.Id,
            ProductName = product.Name ?? string.Empty,
            ProductType = product.Type ?? string.Empty,
            Size = product.Size ?? string.Empty,
            Material = product.Material ?? string.Empty,
            QuantityChange = initialQty,
            Timestamp = DateTime.UtcNow,
            AvailableQuantity = initialQty,
            OperationType = "ProductAdded"
        });

        await _inventoryRepo.SaveChangesAsync();

        return (true, "Created");
    }

    public async Task<List<ProductDto>> SearchProductsAsync(
        int? id,
        string? name,
        string? type,
        string? size,
        string? material,
        string? sortBy = null,
        bool descending = false)
    {
        var query = _context.Products.AsQueryable();
        if (id.HasValue)
            query = query.Where(p => p.Id == id.Value);
        if (!string.IsNullOrEmpty(name))
            query = query.Where(p => p.Name != null &&
               p.Name.ToLower().Contains(name.ToLower()));
        if (!string.IsNullOrEmpty(type))
            query = query.Where(p => p.Type != null &&
                 p.Type.ToLower().Contains(type.ToLower()));
        if (!string.IsNullOrEmpty(size))
            query = query.Where(p => p.Size != null &&
                 p.Size.ToLower().Contains(size.ToLower()));
        if (!string.IsNullOrEmpty(material))
            query = query.Where(p => p.Material != null &&
                p.Material.ToLower().Contains(material.ToLower()));
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

        var changes = new List<string>();
        if (existing.Name != dto.Name) changes.Add($"Name: {existing.Name} -> {dto.Name}");
        if (existing.Type != dto.Type) changes.Add($"Type: {existing.Type} -> {dto.Type}");
        if (existing.Size != dto.Size) changes.Add($"Size: {existing.Size} -> {dto.Size}");
        if (existing.Material != dto.Material) changes.Add($"Material: {existing.Material} -> {dto.Material}");

        existing.Name = dto.Name;
        existing.Type = dto.Type;
        existing.Size = dto.Size;
        existing.Material = dto.Material;

        await _repo.UpdateAsync(existing);
        var status = await _context.InventoryStatuses.FirstOrDefaultAsync(s => s.ProductId == dto.Id);
        int available = status?.AvailableQuantity ?? 0;

        await _inventoryRepo.AddOperationAsync(new InventoryOperation
        {
            ProductId = dto.Id,
            ProductName = dto.Name ?? string.Empty,
            ProductType = dto.Type ?? string.Empty,
            Size = dto.Size ?? string.Empty,
            Material = dto.Material ?? string.Empty,
            QuantityChange = 0,
            Timestamp = DateTime.UtcNow,
            AvailableQuantity = available,
            OperationType = "ProductUpdated",
            ChangeDescription = string.Join("; ", changes)
        });

        await _inventoryRepo.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteProduct(int id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;
        var status = await _context.InventoryStatuses
            .FirstOrDefaultAsync(s => s.ProductId == id);
        int available = 0;
        if (status != null)
        {
           available = status.AvailableQuantity;
            _context.InventoryStatuses.Remove(status);
        }
       available = status?.AvailableQuantity ?? 0;
        await _repo.DeleteAsync(existing);
        await _inventoryRepo.AddOperationAsync(new InventoryOperation
        {
            ProductId = id,
            ProductName = existing.Name ?? string.Empty,
            ProductType = existing.Type ?? string.Empty,
            Size = existing.Size ?? string.Empty,
            Material = existing.Material ?? string.Empty,
            QuantityChange = 0,
            Timestamp = DateTime.UtcNow,
            AvailableQuantity = available,
            OperationType = "ProductDeleted"
        });

      
        await _inventoryRepo.SaveChangesAsync();
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
