using BesmokeInventoryApp.Server.Dtos;
using BesmokeInventoryApp.Server.Models;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _repo;

    public InventoryService(IInventoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<InventoryStatusDto>> GetInventoryStatusAsync()
    {
        var statuses = await _repo.GetAllStatusesAsync();
        return statuses.Select(s => new InventoryStatusDto
        {
            ProductId = s.ProductId,
            AvailableQuantity = s.AvailableQuantity
        }).ToList();
    }

    public async Task<List<InventoryStatusDto>> GetLowStockAsync(int threshold)
    {
        var statuses = await _repo.GetLowStockAsync(threshold);
        return statuses.Select(s => new InventoryStatusDto
        {
            ProductId = s.ProductId,
            AvailableQuantity = s.AvailableQuantity
        }).ToList();
    }

    public async Task<List<InventoryOperationDto>> GetOperationsAsync() // renamed method
    {
        var ops = await _repo.GetAllOperationsAsync();
        return ops.Select(op => new InventoryOperationDto
        {
            Id = op.Id, // include ID
            ProductId = op.ProductId,
            QuantityChange = op.QuantityChange,
            Timestamp = op.Timestamp
        }).ToList();
    }
    public async Task<(List<InventoryOperationDto> Operations, int TotalCount)> GetPagedOperationsAsync(PagedQueryDto query)
    {
        var (ops, totalCount) = await _repo.GetPagedOperationsAsync(query.Page, query.PageSize);
        var dtos = ops.Select(op => new InventoryOperationDto
        {
            Id = op.Id,
            ProductId = op.ProductId,
            QuantityChange = op.QuantityChange,
            Timestamp = op.Timestamp
        }).ToList();
        return (dtos, totalCount);
    }
    public async Task<InventoryStatusDto?> AdjustInventoryAsync(int productId, int quantityChange)
    {
        var status = await _repo.GetStatusAsync(productId);
        if (status == null)
        {
            status = new InventoryStatus { ProductId = productId, AvailableQuantity = 0 };
        }

        status.AvailableQuantity += quantityChange;

        await _repo.AddOperationAsync(new InventoryOperation
        {
            ProductId = productId,
            QuantityChange = quantityChange,
            Timestamp = DateTime.UtcNow
        });

        await _repo.SaveChangesAsync();

        return new InventoryStatusDto
        {
            ProductId = status.ProductId,
            AvailableQuantity = status.AvailableQuantity
        };
    }
}
