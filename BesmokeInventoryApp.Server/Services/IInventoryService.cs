using BesmokeInventoryApp.Server.Dtos;

public interface IInventoryService
{
    Task<List<InventoryStatusDto>> GetInventoryStatusAsync();
    Task<List<InventoryStatusDto>> GetLowStockAsync(int threshold);
    Task<InventoryStatusDto?> AdjustInventoryAsync(int productId, int quantityChange);
    Task<List<InventoryOperationDto>> GetOperationsAsync(); // Correct name
}
