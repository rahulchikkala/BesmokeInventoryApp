namespace BesmokeInventoryApp.Server.Models
{
    public class InventoryStatus
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int AvailableQuantity { get; set; }
    }
}
