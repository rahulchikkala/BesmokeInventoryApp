using BesmokeInventoryApp.Server.Data;
using BesmokeInventoryApp.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
SeedDatabase(app);

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
void SeedDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    if (!db.Products.Any())
    {
        var products = new List<Product>
        {
            new Product { Name = "Glass Beaker", Type = "Beaker", Size = "250 mL", Material = "Glass" },
            new Product { Name = "Plastic Flask", Type = "Erlenmeyer Flask", Size = "100 mL", Material = "Plastic" },
            new Product { Name = "Test Tube", Type = "Tube", Size = "15 mL", Material = "Glass" }
        };

        db.Products.AddRange(products);
        db.SaveChanges();

        foreach (var product in products)
        {
            db.InventoryStatuses.Add(new InventoryStatus
            {
                ProductId = product.Id,
                AvailableQuantity = 100
            });
        }

        db.SaveChanges();
    }
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
