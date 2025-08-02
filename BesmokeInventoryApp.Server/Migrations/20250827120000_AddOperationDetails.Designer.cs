using System;
using BesmokeInventoryApp.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace BesmokeInventoryApp.Server.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20250827120000_AddOperationDetails")]
    partial class AddOperationDetails
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.7")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("BesmokeInventoryApp.Server.Models.InventoryOperation", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("int");

                SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                b.Property<int>("ProductId")
                    .HasColumnType("int");

                b.Property<string>("ProductName")
                    .HasColumnType("nvarchar(max)");

                b.Property<int>("QuantityChange")
                    .HasColumnType("int");

                b.Property<int>("AvailableQuantity")
                    .HasColumnType("int");

                b.Property<string>("OperationType")
                    .HasColumnType("nvarchar(max)");

                b.Property<DateTime>("Timestamp")
                    .HasColumnType("datetime2");

                b.HasKey("Id");

                b.ToTable("InventoryOperations");
            });

            modelBuilder.Entity("BesmokeInventoryApp.Server.Models.InventoryStatus", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("int");

                SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                b.Property<int>("AvailableQuantity")
                    .HasColumnType("int");

                b.Property<int>("ProductId")
                    .HasColumnType("int");

                b.HasKey("Id");

                b.ToTable("InventoryStatuses");
            });

            modelBuilder.Entity("BesmokeInventoryApp.Server.Models.Product", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("int");

                SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                b.Property<string>("Material")
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnType("nvarchar(50)");

                b.Property<string>("Name")
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnType("nvarchar(100)");

                b.Property<string>("Size")
                    .IsRequired()
                    .HasMaxLength(500)
                    .HasColumnType("nvarchar(500)");

                b.Property<string>("Type")
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnType("nvarchar(50)");

                b.HasKey("Id");

                b.ToTable("Products");
            });
#pragma warning restore 612, 618
        }
    }
}