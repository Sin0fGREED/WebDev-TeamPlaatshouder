using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Api.Hubs;
using OfficeCalendar.Infrastructure.Persistence;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Application.DTOs;

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

        // POST /api/events
        g.MapPost("", async (AppDbContext db, IHubContext<CalendarHub> hub, CreateEventDto req) =>
        {
            // pick any existing employee as organizer (demo)
            var organizerId = await db.Employees
                .Select(x => x.Id)
                .FirstAsync();

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

        return g;
    }
}
