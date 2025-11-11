using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Infrastructure.Persistence;

namespace OfficeCalendar.Api.Setup;

public static class DbSeeder
{
    public static async Task<AppUser> AddUserToDb(AppDbContext db, IPasswordHasher<AppUser> hasher, AppUser u, string password)
    {
        var existingUser = await db.Users.Where(e => e.Email == u.Email).FirstOrDefaultAsync();
        Guid userId = Guid.Empty;
        if (existingUser == null)
        {
            u.PasswordHash = hasher.HashPassword(u, password);
            db.Users.Add(u);
            userId = u.Id;
            await db.SaveChangesAsync();
            return u;
        }
        return existingUser;
    }

    public static async Task<Employee> AddEmployeeToDb(AppDbContext db, Employee e)
    {
        var existingEmployee = await db.Employees.Where(em => em.User.Id == e.Id).FirstOrDefaultAsync();
        if (existingEmployee == null)
        {
            db.Employees.Add(e);
            await db.SaveChangesAsync();
            return e;
        }
        return existingEmployee;
    }

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();

        // Ensure DB exists/migrated
        await db.Database.MigrateAsync();

        // Seed admin if missing
        var user1 = await AddUserToDb(db, hasher, new AppUser { Name = "Bob", Email = "bob@gmail.com", Status = "In Office" }, "password");
        var user2 = await AddUserToDb(db, hasher, new AppUser { Name = "Terry", Email = "terry@outlook.com", Status = "In Office" }, "password");
        var user3 = await AddUserToDb(db, hasher, new AppUser { Name = "Violet", Email = "violet@gmail.com", Status = "Remote" }, "password");
        var user4 = await AddUserToDb(db, hasher, new AppUser { Name = "Linda", Email = "linda@outlook.com", Status = "Remote" }, "password");
        var user5 = await AddUserToDb(db, hasher, new AppUser { Name = "Tom", Email = "tom@gmail.com", Status = "Remote" }, "password");
        var user6 = await AddUserToDb(db, hasher, new AppUser { Name = "Gary", Email = "gary@gmail.com", Status = "Out of Office" }, "password");

        var employee1 = await AddEmployeeToDb(db, new Employee { UserId = user1.Id, Role = "Software Developer" });
        var employee2 = await AddEmployeeToDb(db, new Employee { UserId = user2.Id, Role = "Project Manager" });
        var employee3 = await AddEmployeeToDb(db, new Employee { UserId = user3.Id, Role = "Product Owner" });
        var employee4 = await AddEmployeeToDb(db, new Employee { UserId = user4.Id, Role = "Software Developer" });
        var employee5 = await AddEmployeeToDb(db, new Employee { UserId = user5.Id, Role = "Scrum Master" });
        var employee6 = await AddEmployeeToDb(db, new Employee { UserId = user6.Id, Role = "Software Developer" });

    }
}
