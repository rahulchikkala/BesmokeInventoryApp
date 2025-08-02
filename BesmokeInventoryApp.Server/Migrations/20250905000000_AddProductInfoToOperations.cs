using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BesmokeInventoryApp.Server.Migrations
{
    public partial class AddProductInfoToOperations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductType",
                table: "InventoryOperations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "InventoryOperations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Material",
                table: "InventoryOperations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChangeDescription",
                table: "InventoryOperations",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductType",
                table: "InventoryOperations");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "InventoryOperations");

            migrationBuilder.DropColumn(
                name: "Material",
                table: "InventoryOperations");

            migrationBuilder.DropColumn(
                name: "ChangeDescription",
                table: "InventoryOperations");
        }
    }
}