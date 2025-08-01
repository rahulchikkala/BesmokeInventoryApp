using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BesmokeInventoryApp.Server.Migrations
{
    public partial class AddProductNameToInventoryOperations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                table: "InventoryOperations",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductName",
                table: "InventoryOperations");
        }
    }
}