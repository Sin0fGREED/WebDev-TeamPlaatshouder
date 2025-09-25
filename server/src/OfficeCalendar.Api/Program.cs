using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using OfficeCalendar.Api.Hubs;
using OfficeCalendar.Api.Endpoints;
using OfficeCalendar.Api.Setup;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;


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

builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();

builder.Services.AddAuthorization();

// Add cors
builder.Services.AddCors(o => o.AddPolicy("web",
    p => p.WithOrigins("http://localhost:5173")
          .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

// Run migrations and seed users/employees
await DbSeeder.SeedAsync(app.Services);

app.UseCors("web");


app.UseAuthentication();
app.UseAuthorization();


app.MapHub<CalendarHub>("/hubs/calendar");

app.MapGroup("/api/events")
    //.RequireAuthorization()
    .MapEventsApi();

app.MapGroup("/api/auth")
  .MapAuthApi();

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
