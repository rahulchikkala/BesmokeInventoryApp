using BesmokeInventoryApp.Server.Data;
using BesmokeInventoryApp.Server.Models;
using Microsoft.EntityFrameworkCore;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllAsync()
    {
        return await _context.Products.ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _context.Products.FindAsync(id);
    }

    public async Task AddAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Product product)
    {
        var existing = await _context.Products.FirstOrDefaultAsync(p => p.Id == product.Id);
        if (existing != null)
        {
            // Update fields manually to avoid tracking issues
            existing.Name = product.Name;
            existing.Type = product.Type;
            existing.Size = product.Size;
            existing.Material = product.Material;

            await _context.SaveChangesAsync();
        }
    }


    public async Task DeleteAsync(Product product)
    {
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(Product product)
    {
        return await _context.Products.AnyAsync(p =>
            (p.Name ?? "") == (product.Name ?? "") &&
            (p.Type ?? "") == (product.Type ?? "") &&
            (p.Size ?? "") == (product.Size ?? "") &&
            (p.Material ?? "") == (product.Material ?? ""));
    }

    public async Task<List<Product>> GetByTypeAsync(string type)
    {
        return await _context.Products
            .Where(p => p.Type == type)
            .ToListAsync();
    }

}
