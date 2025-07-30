using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BesmokeInventoryApp.Server.Data;
using BesmokeInventoryApp.Server.Models;

namespace BesmokeInventoryApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InventoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/inventory/adjust
        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustInventory(int productId, int quantityChange)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound("Product not found");

            var status = await _context.InventoryStatuses
                .FirstOrDefaultAsync(s => s.ProductId == productId);

            if (status == null)
            {
                status = new InventoryStatus
                {
                    ProductId = productId,
                    AvailableQuantity = 0
                };
                _context.InventoryStatuses.Add(status);
            }

            status.AvailableQuantity += quantityChange;

            _context.InventoryOperations.Add(new InventoryOperation
            {
                ProductId = productId,
                QuantityChange = quantityChange,
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(status);
        }

        // GET: api/inventory/status
        [HttpGet("status")]
        public async Task<ActionResult<IEnumerable<InventoryStatus>>> GetInventory()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _context.InventoryStatuses.ToListAsync();
        }

        // GET: api/inventory/lowstock
        [HttpGet("lowstock")]
        public async Task<ActionResult<IEnumerable<InventoryStatus>>> GetLowStock()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _context.InventoryStatuses
                .Where(s => s.AvailableQuantity < 50)
                .ToListAsync();
        }
    }
}
