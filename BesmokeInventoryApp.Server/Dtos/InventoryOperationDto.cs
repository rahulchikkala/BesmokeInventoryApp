namespace BesmokeInventoryApp.Server.Dtos
{
    public class InventoryOperationDto
    {
        public int Id { get; set; } // Added to fix React key warning
        public int ProductId { get; set; }
        public int QuantityChange { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
