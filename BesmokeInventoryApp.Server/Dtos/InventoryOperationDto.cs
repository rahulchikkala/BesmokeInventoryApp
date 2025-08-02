namespace BesmokeInventoryApp.Server.Dtos
{
    public class InventoryOperationDto
    {
        public int Id { get; set; } // Added to fix React key warning
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductType { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public int QuantityChange { get; set; }
        public DateTime Timestamp { get; set; }
        public int AvailableQuantity { get; set; }
        public string OperationType { get; set; } = "StockChange";
        public string? ChangeDescription { get; set; }
    }
}
