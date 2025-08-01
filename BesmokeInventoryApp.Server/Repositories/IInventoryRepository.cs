using BesmokeInventoryApp.Server.Models;

public interface IInventoryRepository
{
    Task<InventoryStatus?> GetStatusAsync(int productId);
    Task<List<InventoryStatus>> GetAllStatusesAsync();
    Task<List<InventoryStatus>> GetLowStockAsync(int threshold);
    Task<List<InventoryOperation>> GetAllOperationsAsync();
    Task<(List<InventoryOperation> Operations, int TotalCount)> GetPagedOperationsAsync(int page, int pageSize);
    Task AddOperationAsync(InventoryOperation operation);
    Task SaveChangesAsync();
}
