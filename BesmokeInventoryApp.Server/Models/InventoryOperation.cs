namespace BesmokeInventoryApp.Server.Models
{
    public class InventoryOperation
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int ProductId { get; set; }

        public string? ProductName { get; set; }
        public string? ProductType { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public int QuantityChange { get; set; } // Positive = in, Negative = out
        public int AvailableQuantity { get; set; }
        public string OperationType { get; set; } = "StockChange";
        public string? ChangeDescription { get; set; }
    }
}
