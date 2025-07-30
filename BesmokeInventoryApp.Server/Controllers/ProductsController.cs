using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BesmokeInventoryApp.Server.Data;
using BesmokeInventoryApp.Server.Models;

namespace BesmokeInventoryApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
        }
        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product updatedProduct)
        {
            if (id != updatedProduct.Id)
                return BadRequest("Product ID mismatch.");

            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Product not found.");

            product.Name = updatedProduct.Name;
            product.Type = updatedProduct.Type;
            product.Size = updatedProduct.Size;
            product.Material = updatedProduct.Material;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Product not found.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
