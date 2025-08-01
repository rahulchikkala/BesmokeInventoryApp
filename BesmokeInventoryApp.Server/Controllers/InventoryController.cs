using BesmokeInventoryApp.Server.Dtos;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;

    public InventoryController(IInventoryService service)
    {
        _service = service;
    }

    [HttpGet("operations")]
    public async Task<ActionResult<List<InventoryOperationDto>>> GetOperations()
    {
        var ops = await _service.GetAllOperationsAsync();
        return Ok(ops);
    }



    [HttpGet("lowstock")]
    public async Task<ActionResult<List<InventoryStatusDto>>> GetLowStock([FromQuery] int threshold = 50)
    {
        return await _service.GetLowStockAsync(threshold);
    }

 

    [HttpPost("adjust")]
    public async Task<ActionResult<InventoryStatusDto>> AdjustInventory(int productId, int quantityChange)
    {
        var result = await _service.AdjustInventoryAsync(productId, quantityChange);
        return result is null ? NotFound("Product not found") : Ok(result);
    }
}
