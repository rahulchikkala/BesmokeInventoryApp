using BesmokeInventoryApp.Server.Models;

public interface IInventoryRepository
{
    Task<InventoryStatus?> GetStatusAsync(int productId);
    Task<List<InventoryStatus>> GetAllStatusesAsync();
    Task<List<InventoryStatus>> GetLowStockAsync(int threshold);
    Task<List<InventoryOperation>> GetAllOperationsAsync(DateTime? startTime, DateTime? endTime);
    Task<(List<InventoryOperation> Operations, int TotalCount)> GetPagedOperationsAsync(int page, int pageSize, DateTime? startTime, DateTime? endTime);
    Task AddOperationAsync(InventoryOperation operation);
    Task SaveChangesAsync();
}
