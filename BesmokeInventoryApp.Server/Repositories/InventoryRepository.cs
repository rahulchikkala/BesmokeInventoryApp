using BesmokeInventoryApp.Server.Data;
using BesmokeInventoryApp.Server.Models;
using Microsoft.EntityFrameworkCore;

public class InventoryRepository : IInventoryRepository
{
    private readonly ApplicationDbContext _context;

    public InventoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<InventoryStatus?> GetStatusAsync(int productId)
    {
        return await _context.InventoryStatuses.FirstOrDefaultAsync(s => s.ProductId == productId);
    }

    public async Task<List<InventoryStatus>> GetAllStatusesAsync()
    {
        return await _context.InventoryStatuses.ToListAsync();
    }

    public async Task<List<InventoryStatus>> GetLowStockAsync(int threshold)
    {
        return await _context.InventoryStatuses
            .Where(s => s.AvailableQuantity < threshold)
            .ToListAsync();
    }

    public async Task<List<InventoryOperation>> GetAllOperationsAsync()
    {
        return await _context.InventoryOperations.OrderByDescending(o => o.Timestamp).ToListAsync();
    }

    public async Task AddOperationAsync(InventoryOperation operation)
    {
        await _context.InventoryOperations.AddAsync(operation);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
