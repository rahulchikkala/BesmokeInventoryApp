using BesmokeInventoryApp.Server.Dtos;

public interface IProductService
{
    Task<List<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProduct(int id);
    Task<(bool Success, string Message)> CreateProduct(ProductDto productDto);
    Task<List<ProductDto>> SearchByNameAsync(string name, string? sortBy = null, bool descending = false);

    Task<bool> UpdateProduct(ProductDto dto);
    Task<bool> DeleteProduct(int id);
    Task<List<ProductDto>> GetProductsByTypeAsync(string type);
    Task<(List<ProductDto> Products, int TotalCount)> GetPagedProductsAsync(ProductQueryDto query);

}
