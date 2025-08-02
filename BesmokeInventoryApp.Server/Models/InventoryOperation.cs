namespace BesmokeInventoryApp.Server.Models
{
    public class InventoryOperation
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int ProductId { get; set; }

        public string? ProductName { get; set; }
        public int QuantityChange { get; set; } // Positive = in, Negative = out
        public int AvailableQuantity { get; set; }
        public string OperationType { get; set; } = "StockChange";
    }
}
