using BesmokeInventoryApp.Server.Dtos;
using BesmokeInventoryApp.Server.Models;

namespace BesmokeInventoryApp.Server.Mappers
{
    public static class ProductMapper
    {
        public static ProductDto ToDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name ?? string.Empty,
                Type = product.Type ?? string.Empty,
                Size = product.Size ?? string.Empty,
                Material = product.Material ?? string.Empty,
                InitialQuantity = 0
            };
        }

        public static Product ToEntity(ProductDto dto)
        {
            return new Product
            {
                Id = dto.Id,
                Name = dto.Name,
                Type = dto.Type,
                Size = dto.Size,
                Material = dto.Material
            };
        }
    }
}
