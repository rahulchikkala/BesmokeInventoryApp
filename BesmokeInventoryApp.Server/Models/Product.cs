namespace BesmokeInventoryApp.Server.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Type { get; set; }       // e.g., Flask, Beaker
        public string? Size { get; set; }       // e.g., 50 mL
        public string? Material { get; set; }   // Glass or Plastic
    }
}
