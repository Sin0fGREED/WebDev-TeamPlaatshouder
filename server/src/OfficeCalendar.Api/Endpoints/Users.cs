using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Infrastructure.Persistence;

namespace OfficeCalendar.Api.Endpoints;

public static class UsersApi
{
    public static RouteGroupBuilder MapUsersApi(this RouteGroupBuilder g)
    {
        // GET /api/users
        g.MapGet("", async (
            AppDbContext db
            ) =>
        {

            var users = await db.Users.ToListAsync();

            return Results.Ok(users);
        });

        // GET /api/users/{user_id}
        g.MapGet("/{user_id}", async (Guid user_id, AppDbContext db) =>
        {
            var user = await db.Users
                .Where(u => u.Id == user_id)
                .FirstAsync();

            return Results.Ok(user);

        });

        return g;

    }
}
