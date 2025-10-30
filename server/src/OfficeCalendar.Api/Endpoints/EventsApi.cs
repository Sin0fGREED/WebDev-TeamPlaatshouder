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
                .Select(e => new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId))
                .ToListAsync(ct);

            return Results.Ok(items);
        });

        // GET /api/events/{event_id}
        g.MapGet("/{event_id}", async (Guid event_id, AppDbContext db) =>
        {
            var item = await db.Events
                .Where(e => e.Id == event_id)
                .Select(e => new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId)).FirstAsync();

            return Results.Ok(item);

        });

        // POST /api/events
        g.MapPost("", async (AppDbContext db, IHubContext<CalendarHub> hub, CreateEventDto req, ClaimsPrincipal user) =>
        {
            var userId = user.Identity!.Name!;
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var id = Guid.Parse(userId);

            var organizerId = await db.Employees
                .Where(e => e.Id == id)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

            Console.WriteLine($"{userId}: {id} : {organizerId}");

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
                OrganizerId = organizerId
            };

            db.Events.Add(e);
            await db.SaveChangesAsync();

            var dto = new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId);
            await hub.Clients.All.SendAsync("event:created", dto);
            return Results.Created($"/api/events/{e.Id}", dto);
        });


        // PUT /api/events/{event_id}
        g.MapPut("/{event_id}", async (Guid eventId, AppDbContext db, IHubContext<CalendarHub> hub, CreateEventDto req, ClaimsPrincipal user) =>
        {
            var userId = Guid.Parse(user.FindFirst("sub")!.Value);
            if (userId != eventId)
                return Results.Forbid();

            var e = await db.Events.FindAsync(eventId);
            if (e is null)
                return Results.NotFound();

            e.Title = req.Title;
            e.Description = req.Description;
            e.Attendees = req.Attendees;
            e.StartUtc = req.StartUtc;
            e.EndUtc = req.StartUtc;

            db.Events.Entry(e).State = EntityState.Modified;

            await db.SaveChangesAsync();

            var dto = new EventDto(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId);
            await hub.Clients.All.SendAsync("event:created", dto);
            return Results.Created($"/api/events/{e.Id}", dto);

        });

        // TODO : Make this locked for admins only or completely remove this function :)
        // DELETE /api/events
        g.MapDelete("/delete",
             //[Authorize(Roles = "Admin")]
             async (AppDbContext db) =>
        {
            // Delete children first if no cascade
            await db.Events.ExecuteDeleteAsync();

            //await db.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('dbo.Events', RESEED, 0);");

            return Results.NoContent();
        });

        // TODO: Constrain this action to admins or users that own the event
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
            });


        return g;
    }
}
