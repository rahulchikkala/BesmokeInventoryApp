using BesmokeInventoryApp.Server.Dtos;

public interface IInventoryService
{
    Task<List<InventoryStatusDto>> GetInventoryStatusAsync();
    Task<List<InventoryStatusDto>> GetLowStockAsync(int threshold);
    Task<InventoryStatusDto?> AdjustInventoryAsync(int productId, int quantityChange);
    Task<List<InventoryOperationDto>> GetOperationsAsync(DateTime? startTime, DateTime? endTime);

    Task<(List<InventoryOperationDto> Operations, int TotalCount)> GetPagedOperationsAsync(PagedQueryDto query);
}
