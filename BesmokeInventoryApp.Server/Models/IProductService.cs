

using BesmokeInventoryApp.Server.Models;

public interface IProductService
{
    Task<List<Product>> GetAllProducts();
    Task<Product?> GetProduct(int id);
    Task<(bool Success, string Message)> CreateProduct(Product product);
    Task<bool> UpdateProduct(Product product);
    Task<bool> DeleteProduct(int id);
}
