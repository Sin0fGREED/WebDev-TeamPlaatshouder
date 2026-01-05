using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Api.Hubs;
using OfficeCalendar.Infrastructure.Persistence;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Application.DTOs;
using System.Security.Claims;

namespace OfficeCalendar.Api.Endpoints;

public static class EventsApi
{
    public static RouteGroupBuilder MapEventsApi(this RouteGroupBuilder g)
    {
        // GET /api/events?from=...&to=...
        g.MapGet("", async (
            AppDbContext db,
            [FromQuery] DateTimeOffset from,
            [FromQuery] DateTimeOffset to,
            CancellationToken ct) =>
        {
            var items = await db.Events
                .Where(e => e.StartUtc < to.UtcDateTime && e.EndUtc > from.UtcDateTime)
                .Select(e => new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId, e.Attendees))
                .ToListAsync(ct);

            return Results.Ok(items);
        }).RequireAuthorization();

        // GET /api/events/{event_id}
        g.MapGet("/{event_id}", async (Guid event_id, AppDbContext db) =>
        {
            var item = await db.Events
                .Where(e => e.Id == event_id)
                .Select(e => new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId, e.Attendees)).FirstAsync();

            return Results.Ok(item);

        }).RequireAuthorization();

        // POST /api/events
        g.MapPost("", async (AppDbContext db, IHubContext<CalendarHub> hub, CreateEventDto req, ClaimsPrincipal user) =>
        {
            var userIdString = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdString))
            {
                return Results.Unauthorized();
            }

            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Results.Unauthorized();
            }
            var organizerId = await db.Employees
           .Where(e => e.UserId == userId)
           .Select(e => e.Id)
           .FirstOrDefaultAsync();

            if (organizerId == Guid.Empty)
            {
                return Results.NotFound();
            }

            var e = new CalendarEvent
            {
                Title = req.Title,
                StartUtc = req.StartUtc,
                EndUtc = req.EndUtc,
                RoomId = req.RoomId,
                Attendees = req.Attendees,
                OrganizerId = organizerId
            };

            db.Events.Add(e);
            await db.SaveChangesAsync();

            // Create + broadcast notification
            var actorName = user.FindFirstValue(ClaimTypes.Email)
                            ?? user.FindFirstValue(ClaimTypes.Name)
                            ?? user.Identity?.Name;
            actorName ??= "Unknown";

            var notif = new NotificationDto(
                Guid.NewGuid(),
                userId,
                actorName,
                "EventCreated",
                $"{actorName} created event '{e.Title}'",
                e.Id,
                DateTime.UtcNow,
                false
            );

            db.Notifications.Add(new OfficeCalendar.Domain.Entities.Notification
            {
                Id = notif.Id,
                ActorId = notif.ActorId,
                ActorName = notif.ActorName,
                RecipientId = null,
                Action = notif.Action,
                Message = notif.Message,
                EventId = notif.EventId,
                Timestamp = notif.Timestamp
            });
            await db.SaveChangesAsync();

            await hub.Clients.All.SendAsync("notification:created", notif);

            var dto = new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId, e.Attendees);
            await hub.Clients.All.SendAsync("event:created", dto);
            return Results.Created($"/api/events/{e.Id}", dto);
        }).RequireAuthorization();


        // PUT /api/events/{event_id}
        g.MapPut("/{event_id}", async (Guid eventId, AppDbContext db, IHubContext<CalendarHub> hub, CreateEventDto req, ClaimsPrincipal user) =>
        {
            var userIdString = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdString))
            {
                return Results.Unauthorized();
            }

            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Results.Unauthorized();
            }

            var e = await db.Events.FindAsync(eventId);
            if (e is null)
                return Results.NotFound();

            if (userId != e.OrganizerId)
                return Results.Forbid();

            e.Title = req.Title;
            e.Description = req.Description;
            e.Attendees = req.Attendees;
            e.StartUtc = req.StartUtc;
            e.EndUtc = req.EndUtc;

            db.Events.Entry(e).State = EntityState.Modified;

            await db.SaveChangesAsync();

            var actorName = user.FindFirstValue(ClaimTypes.Email)
                            ?? user.FindFirstValue(ClaimTypes.Name)
                            ?? user.Identity?.Name;
            actorName ??= "Unknown";

            var notif = new NotificationDto(
                Guid.NewGuid(),
                userId,
                actorName,
                "EventUpdated",
                $"{actorName} updated event '{e.Title}'",
                e.Id,
                DateTime.UtcNow,
                false
            );

            db.Notifications.Add(new OfficeCalendar.Domain.Entities.Notification
            {
                Id = notif.Id,
                ActorId = notif.ActorId,
                ActorName = notif.ActorName,
                RecipientId = null,
                Action = notif.Action,
                Message = notif.Message,
                EventId = notif.EventId,
                Timestamp = notif.Timestamp
            });
            await db.SaveChangesAsync();

            await hub.Clients.All.SendAsync("notification:created", notif);

            var dto = new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId, e.Attendees);
            await hub.Clients.All.SendAsync("event:updated", dto);
            return Results.Ok(dto);

        }).RequireAuthorization();

           // DELETE /api/events
        g.MapDelete("/delete",
             //[Authorize(Roles = "Admin")]
             async (AppDbContext db) =>
        {
            // Delete children first if no cascade
            await db.Events.ExecuteDeleteAsync();

            //await db.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('dbo.Events', RESEED, 0);");

            return Results.NoContent();
        }).RequireAuthorization();

        g.MapDelete("/delete/{event_id}", async (Guid event_id, AppDbContext db, ClaimsPrincipal user) =>
            {
                var userId = Guid.Parse(user.FindFirst("sub")!.Value);

                var e = await db.Events.FindAsync(event_id);
                if (e is null)
                    return Results.NotFound();

                if (e.OrganizerId != userId)
                    return Results.Forbid();

                db.Events.Remove(e);
                await db.SaveChangesAsync();
                return Results.NoContent();
            }).RequireAuthorization();

        // POST /api/events/{event_id}/notify
        g.MapPost("/{event_id}/notify", async (Guid event_id, AppDbContext db, IHubContext<CalendarHub> hub, ClaimsPrincipal user) =>
        {
            // find event
            var e = await db.Events.FindAsync(event_id);
            if (e is null)
                return Results.NotFound();

            // resolve actor id from common claim types
            var userIdString = user.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)
                               ?? user.FindFirstValue("sub")
                               ?? user.FindFirstValue("id")
                               ?? user.FindFirstValue("uid");

            if (string.IsNullOrWhiteSpace(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Results.Unauthorized();
            }

            // prefer name from token, fallback to DB
            var actorName = user.FindFirstValue(System.Security.Claims.ClaimTypes.Name)
                            ?? user.FindFirstValue("name")
                            ?? user.Identity?.Name;

            if (string.IsNullOrWhiteSpace(actorName))
            {
                actorName = await db.Employees
                    .Where(emp => emp.UserId == userId)
                    .Select(emp => emp.User.Name)
                    .FirstOrDefaultAsync();
            }

            var notif = new NotificationDto(
                Guid.NewGuid(),
                userId,
                actorName ?? "Unknown",
                "ManualNotification",
                $"{actorName ?? "Someone"} triggered a notification for event '{e.Title}'",
                e.Id,
                DateTime.UtcNow,
                false
            );

            // persist notification (recipient null => broadcast/global)
            var nEntity = new OfficeCalendar.Domain.Entities.Notification
            {
                Id = notif.Id,
                ActorId = notif.ActorId,
                ActorName = notif.ActorName,
                RecipientId = null,
                Action = notif.Action,
                Message = notif.Message,
                EventId = notif.EventId,
                Timestamp = notif.Timestamp
            };

            db.Notifications.Add(nEntity);
            await db.SaveChangesAsync();

            await hub.Clients.All.SendAsync("notification:created", notif);

            return Results.Accepted();
        }).RequireAuthorization();

        

        return g;
    }
}
