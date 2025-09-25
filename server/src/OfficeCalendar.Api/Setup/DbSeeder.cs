using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Infrastructure.Persistence;

namespace OfficeCalendar.Api.Setup;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();

        // Ensure DB exists/migrated
        await db.Database.MigrateAsync();

        // Seed admin if missing
        const string adminEmail = "admin@test.com";
        const string adminPassword = "password"; // dev-only

        var adminExists = await db.Users.AnyAsync(u => u.Email == adminEmail);
        if (!adminExists)
        {
            var admin = new AppUser
            {
                Email = adminEmail,
                IsActive = true
            };
            admin.PasswordHash = hasher.HashPassword(admin, adminPassword);

            db.Users.Add(admin);
            await db.SaveChangesAsync();
        }

        // Seed a demo employee if none exist (needed for OrganizerId FK)
        var employeeExists = await db.Employees.AnyAsync();
        if (!employeeExists)
        {
            db.Employees.Add(new Employee
            {
                FirstName = "Demo",
                LastName = "User",
                Email = "demo@company.com",
                Role = "Employee",
                IsActive = true
            });
            await db.SaveChangesAsync();
        }
    }
}
