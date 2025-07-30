using System.ComponentModel.DataAnnotations;

namespace BesmokeInventoryApp.Server.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        [Display(Name = "Product Name")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        [MinLength(1, ErrorMessage = "Name must be at least 1 character long.")]
        [RegularExpression(@"^[a-zA-Z0-9\s]+$", ErrorMessage = "Name can only contain letters, numbers, and spaces.")]

        public string? Name { get; set; }

        [Required]
        [Display(Name = "Product Type")]
        [StringLength(50, ErrorMessage = "Type cannot be longer than 50 characters.")]
        [MinLength(1, ErrorMessage = "Type must be at least 1 character long.")]
        [RegularExpression(@"^[a-zA-Z0-9\s]+$", ErrorMessage = "Type can only contain letters, numbers, and spaces.")]
        public string? Type { get; set; }

        [Required]
        [Display(Name = "Product Description")]
        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters.")]
        [MinLength(1, ErrorMessage = "Description must be at least 1 character long.")]
        [RegularExpression(@"^[a-zA-Z0-9\s,.]+$", ErrorMessage = "Description can only contain letters, numbers, spaces, commas, and periods.")]
        public string? Size { get; set; }

        [Required]
        [Display(Name = "Product Material")]
        [StringLength(50, ErrorMessage = "Material cannot be longer than 50 characters.")]
        [MinLength(1, ErrorMessage = "Material must be at least 1 character long.")]
        [RegularExpression(@"^[a-zA-Z0-9\s]+$", ErrorMessage = "Material can only contain letters, numbers, and spaces.")]
        public string? Material { get; set; }
    }
}
