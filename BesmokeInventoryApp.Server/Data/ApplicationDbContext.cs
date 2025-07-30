using BesmokeInventoryApp.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace BesmokeInventoryApp.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<InventoryOperation> InventoryOperations { get; set; }
        public DbSet<InventoryStatus> InventoryStatuses { get; set; }
    }
}
