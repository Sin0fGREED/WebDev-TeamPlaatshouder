using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using OfficeCalendar.Api.Hubs;
using OfficeCalendar.Api.Endpoints;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Infrastructure.Persistence;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// JWT authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// Add cors
builder.Services.AddCors(o => o.AddPolicy("web",
    p => p.WithOrigins("http://localhost:5173")
          .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

// Auto-apply migrations in dev/container
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed a demo employee if none exist (needed for OrganizerId FK)
    if (!db.Employees.Any())
    {
        db.Employees.Add(new Employee
        {
            FirstName = "Demo",
            LastName = "User",
            Email = "demo@company.com",
            Role = "Employee",
            IsActive = true
        });
        db.SaveChanges();
    }
}

app.UseCors("web");

app.UseAuthentication();
app.UseAuthorization();


app.MapHub<CalendarHub>("/hubs/calendar");

app.MapGroup("/api/events")
    //.RequireAuthorization()
    .MapEventsApi();

if (app.Environment.IsDevelopment())
// Configure the HTTP request pipeline.
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.Run();
