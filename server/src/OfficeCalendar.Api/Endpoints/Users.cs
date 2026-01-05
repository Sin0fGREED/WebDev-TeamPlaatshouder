using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Infrastructure.Persistence;

namespace OfficeCalendar.Api.Endpoints;

public static class UsersApi
{
    public static RouteGroupBuilder MapUsersApi(this RouteGroupBuilder g)
    {
        // GET /api/users?search=...
        g.MapGet(
                "",
                async (AppDbContext db, [FromQuery] string search, CancellationToken ct) =>
                {
                    var q = db.Users.AsQueryable();

                    if (!string.IsNullOrWhiteSpace(search))
                        q = q.Where(u => u.Email.Contains(search));

                    return Results.Ok(await q.ToListAsync(ct));
                }
            )
            .RequireAuthorization();

        // GET /api/users/{user_id}
        g.MapGet(
                "/{user_id}",
                async (Guid user_id, AppDbContext db) =>
                {
                    var user = await db.Users.Where(u => u.Id == user_id).FirstAsync();

                    return Results.Ok(user);
                }
            )
            .RequireAuthorization();

        return g;
    }
}
