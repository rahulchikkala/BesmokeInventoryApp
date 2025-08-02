using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BesmokeInventoryApp.Server.Migrations
{
    public partial class AddOperationDetails : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AvailableQuantity",
                table: "InventoryOperations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "OperationType",
                table: "InventoryOperations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableQuantity",
                table: "InventoryOperations");

            migrationBuilder.DropColumn(
                name: "OperationType",
                table: "InventoryOperations");
        }
    }
}