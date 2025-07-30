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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _context.Products.ToListAsync();
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            bool exists = await _context.Products.AnyAsync(p =>
    p.Name == product.Name &&
    p.Type == product.Type &&
    p.Size == product.Size &&
    p.Material == product.Material);

            if (exists)
            {
                return Conflict("A product with the same name, type, size, and material already exists.");
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
        }
        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product updatedProduct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Product not found.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
