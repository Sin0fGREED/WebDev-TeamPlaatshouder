using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Application.DTOs;
using OfficeCalendar.Infrastructure.Persistence;
using System.Security.Claims;

namespace OfficeCalendar.Api.Endpoints;

public static class NotificationsApi
{
    public static RouteGroupBuilder MapNotificationsApi(this RouteGroupBuilder g)
    {
        // GET /api/notifications?page=1&pageSize=20
        g.MapGet("", async (AppDbContext db, ClaimsPrincipal user, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] bool includeRead = false) =>
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;

            // Try to resolve current user id from claims 
            var userIdString = user.FindFirst("sub")?.Value
                               ?? user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            Guid? userId = null;
            if (Guid.TryParse(userIdString, out var parsed)) userId = parsed;

            // Return notifications that are either global (RecipientId null) or targeted to this user
            // By default exclude notifications the user has marked read; includeRead=true returns everything
            var q = db.Notifications.AsQueryable();
            if (userId.HasValue)
            {
                if (!includeRead)
                {
                    q = q.Where(n => (n.RecipientId == null || n.RecipientId == userId.Value)
                                      && !db.NotificationDismissals.Any(nd => nd.NotificationId == n.Id && nd.UserId == userId.Value && nd.IsRead));
                }
                else
                {
                    q = q.Where(n => n.RecipientId == null || n.RecipientId == userId.Value);
                }
            }
            else
            {
                q = q.Where(n => n.RecipientId == null);
            }

            var items = await q
                .OrderByDescending(n => n.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificationDto(
                    n.Id,
                    n.ActorId,
                    n.ActorName,
                    n.Action,
                    n.Message,
                    n.EventId,
                    n.Timestamp,
                    userId.HasValue && db.NotificationDismissals.Any(nd => nd.NotificationId == n.Id && nd.UserId == userId.Value && nd.IsRead)
                ))
                .ToListAsync();

            return Results.Ok(items);
        }).RequireAuthorization();

        // DELETE /api/notifications/{id} - dismiss for current user
        g.MapDelete("/{id}", async (Guid id, AppDbContext db, ClaimsPrincipal user) =>
        {
            var userIdString = user.FindFirst("sub")?.Value
                               ?? user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userIdString, out var userId))
                return Results.Unauthorized();

            var exists = await db.Notifications.AnyAsync(n => n.Id == id);
            if (!exists)
                return Results.NotFound();

            var already = await db.NotificationDismissals.FindAsync(id, userId);
            if (already is null)
            {
                db.NotificationDismissals.Add(new OfficeCalendar.Domain.Entities.NotificationDismissal
                {
                    NotificationId = id,
                    UserId = userId,
                    IsRead = true,
                    DismissedAt = DateTime.UtcNow
                });

                await db.SaveChangesAsync();
            }

            return Results.NoContent();
        }).RequireAuthorization();

        return g;
    }
}
