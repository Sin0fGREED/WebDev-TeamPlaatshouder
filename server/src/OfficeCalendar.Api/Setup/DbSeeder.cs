using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Infrastructure.Persistence;

namespace OfficeCalendar.Api.Setup;

public static class DbSeeder
{
    public static async Task<AppUser> AddUserToDb(
        AppDbContext db,
        IPasswordHasher<AppUser> hasher,
        AppUser u,
        string password
    )
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

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();

        // Ensure DB exists/migrated
        await db.Database.MigrateAsync();

        // Seed admin if missing
        var user1 = await AddUserToDb(
            db,
            hasher,
            new AppUser
            {
                Name = "Bob",
                Email = "bob@gmail.com",
                Status = "In Office",
            },
            "password"
        );
        var user2 = await AddUserToDb(
            db,
            hasher,
            new AppUser
            {
                Name = "Terry",
                Email = "terry@outlook.com",
                Status = "In Office",
            },
            "password"
        );
        var user3 = await AddUserToDb(
            db,
            hasher,
            new AppUser
            {
                Name = "Violet",
                Email = "violet@gmail.com",
                Status = "Remote",
            },
            "password"
        );
        var user4 = await AddUserToDb(
            db,
            hasher,
            new AppUser
            {
                Name = "Linda",
                Email = "linda@outlook.com",
                Status = "Remote",
            },
            "password"
        );
        var user5 = await AddUserToDb(
            db,
            hasher,
            new AppUser
            {
                Name = "Tom",
                Email = "tom@gmail.com",
                Status = "Remote",
            },
            "password"
        );
        var user6 = await AddUserToDb(
            db,
            hasher,
            new AppUser
            {
                Name = "Gary",
                Email = "gary@gmail.com",
                Status = "Out of Office",
            },
            "password"
        );
    }
}
