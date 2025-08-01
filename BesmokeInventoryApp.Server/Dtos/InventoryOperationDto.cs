namespace BesmokeInventoryApp.Server.Dtos
{
    public class InventoryOperationDto
    {
        public int ProductId { get; set; }
        public int QuantityChange { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
