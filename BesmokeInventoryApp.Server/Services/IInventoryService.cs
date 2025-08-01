using BesmokeInventoryApp.Server.Dtos;

public interface IInventoryService
{
    Task<List<InventoryStatusDto>> GetInventoryStatusAsync();
    Task<List<InventoryStatusDto>> GetLowStockAsync(int threshold);
    Task<List<InventoryOperationDto>> GetAllOperationsAsync();
    Task<InventoryStatusDto?> AdjustInventoryAsync(int productId, int quantityChange);
}
