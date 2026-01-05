using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Api.Hubs;
using OfficeCalendar.Application.DTOs;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Infrastructure.Persistence;

namespace OfficeCalendar.Api.Endpoints;

public static class EventsApi
{
    public static RouteGroupBuilder MapEventsApi(this RouteGroupBuilder g)
    {
        // GET /api/events?from=...&to=...
        g.MapGet(
                "",
                async (
                    AppDbContext db,
                    [FromQuery] DateTimeOffset from,
                    [FromQuery] DateTimeOffset to,
                    CancellationToken ct
                ) =>
                {
                    var items = await db
                        .Events.Where(e =>
                            e.StartUtc < to.UtcDateTime && e.EndUtc > from.UtcDateTime
                        )
                        .Select(e => new EventDto(
                            e.Id,
                            e.Title,
                            e.StartUtc,
                            e.EndUtc,
                            e.RoomId,
                            e.Attendees.Select(a => new AttendeeDto(
                                    a.UserId,
                                    a.User.Email,
                                    a.Response
                                ))
                                .ToList()
                        ))
                        .ToListAsync(ct);

                    return Results.Ok(items);
                }
            )
            .RequireAuthorization();

        // GET /api/events/{event_id}
        g.MapGet(
                "/{event_id:guid}",
                async (Guid event_id, AppDbContext db, CancellationToken ct) =>
                {
                    var item = await db
                        .Events.Where(e => e.Id == event_id)
                        .Select(e => new EventDto(
                            e.Id,
                            e.Title,
                            e.StartUtc,
                            e.EndUtc,
                            e.RoomId,
                            e.Attendees.Select(a => new AttendeeDto(
                                    a.UserId,
                                    a.User.Email,
                                    a.Response
                                ))
                                .ToList()
                        ))
                        .FirstOrDefaultAsync(ct);

                    return item is null ? Results.NotFound() : Results.Ok(item);
                }
            )
            .RequireAuthorization();

        // POST /api/events
        g.MapPost(
                "",
                async (
                    AppDbContext db,
                    IHubContext<CalendarHub> hub,
                    CreateEventDto req,
                    ClaimsPrincipal user
                ) =>
                {
                    var userIdString = user.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (string.IsNullOrWhiteSpace(userIdString))
                    {
                        Console.WriteLine("userId is null!");
                        return Results.Unauthorized();
                    }

                    if (!Guid.TryParse(userIdString, out var userId))
                    {
                        Console.WriteLine($"Could not parse user id: {userIdString}");
                        return Results.Unauthorized();
                    }
                    var organizerId = await db
                        .Users.Where(e => e.Id == userId)
                        .Select(e => e.Id)
                        .FirstOrDefaultAsync();

                    if (organizerId == Guid.Empty)
                    {
                        return Results.NotFound();
                    }

                    var ev = new CalendarEvent
                    {
                        Title = req.Title,
                        Description = req.Description,
                        StartUtc = req.StartUtc,
                        EndUtc = req.EndUtc,
                        RoomId = req.RoomId,
                        OrganizerId = organizerId,
                    };

                    db.Events.Add(ev);
                    await db.SaveChangesAsync();

                    Console.WriteLine(
                        $"CreateEvent: attendees in request = {req.Attendees?.Count ?? 0}"
                    );

                    foreach (var uid in req.Attendees.Select(a => a.UserId).Distinct())
                    {
                        db.Attendees.Add(
                            new Attendee
                            {
                                CalendarEventId = ev.Id,
                                UserId = uid,
                                Response = AttendeeResponse.Pending,
                            }
                        );
                    }
                    await db.SaveChangesAsync();

                    // Create + broadcast notification
                    var actorName =
                        user.FindFirstValue(ClaimTypes.Email)
                        ?? user.FindFirstValue(ClaimTypes.Name)
                        ?? user.Identity?.Name;
                    actorName ??= "Unknown";

                    var notif = new NotificationDto(
                        Guid.NewGuid(),
                        userId,
                        actorName,
                        "EventCreated",
                        $"{actorName} created event '{ev.Title}'",
                        ev.Id,
                        DateTime.UtcNow,
                        false
                    );

                    db.Notifications.Add(
                        new OfficeCalendar.Domain.Entities.Notification
                        {
                            Id = notif.Id,
                            ActorId = notif.ActorId,
                            ActorName = notif.ActorName,
                            RecipientId = null,
                            Action = notif.Action,
                            Message = notif.Message,
                            EventId = notif.EventId,
                            Timestamp = notif.Timestamp,
                        }
                    );
                    await db.SaveChangesAsync();

                    await hub.Clients.All.SendAsync("notification:created", notif);

                    // build DTO for response + SignalR
                    var dto = await db
                        .Events.Where(e => e.Id == ev.Id)
                        .Select(e => new EventDto(
                            e.Id,
                            e.Title,
                            e.StartUtc,
                            e.EndUtc,
                            e.RoomId,
                            e.Attendees.Select(a => new AttendeeDto(
                                    a.UserId,
                                    a.User.Email,
                                    a.Response
                                ))
                                .ToList()
                        ))
                        .FirstAsync();
                    await hub.Clients.All.SendAsync("event:created", dto);
                    return Results.Created($"/api/events/{dto.Id}", dto);
                }
            )
            .RequireAuthorization();

        // PUT /api/events/{event_id}
        g.MapPut(
                "/{event_id}",
                async (
                    Guid eventId,
                    AppDbContext db,
                    IHubContext<CalendarHub> hub,
                    CreateEventDto req,
                    ClaimsPrincipal user
                ) =>
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

                    var ev = new CalendarEvent
                    {
                        Title = req.Title,
                        Description = req.Description,
                        StartUtc = req.StartUtc,
                        EndUtc = req.EndUtc,
                        RoomId = req.RoomId,
                        OrganizerId = userId,
                    };

                    db.Events.Add(ev);
                    await db.SaveChangesAsync();

                    Console.WriteLine(
                        $"CreateEvent: attendees in request = {req.Attendees?.Count ?? 0}"
                    );

                    foreach (var uid in req.Attendees.Select(a => a.UserId).Distinct())
                    {
                        db.Attendees.Add(
                            new Attendee
                            {
                                CalendarEventId = ev.Id,
                                UserId = uid,
                                Response = AttendeeResponse.Pending,
                            }
                        );
                    }
                    await db.SaveChangesAsync();
                    var actorName =
                        user.FindFirstValue(ClaimTypes.Email)
                        ?? user.FindFirstValue(ClaimTypes.Name)
                        ?? user.Identity?.Name;
                    actorName ??= "Unknown";

                    var notif = new NotificationDto(
                        Guid.NewGuid(),
                        userId,
                        actorName,
                        "EventUpdated",
                        $"{actorName} updated event '{ev.Title}'",
                        ev.Id,
                        DateTime.UtcNow,
                        false
                    );

                    db.Notifications.Add(
                        new OfficeCalendar.Domain.Entities.Notification
                        {
                            Id = notif.Id,
                            ActorId = notif.ActorId,
                            ActorName = notif.ActorName,
                            RecipientId = null,
                            Action = notif.Action,
                            Message = notif.Message,
                            EventId = notif.EventId,
                            Timestamp = notif.Timestamp,
                        }
                    );
                    await db.SaveChangesAsync();

                    await hub.Clients.All.SendAsync("notification:created", notif);
                    // build DTO for response + SignalR
                    var dto = await db
                        .Events.Where(e => e.Id == ev.Id)
                        .Select(e => new EventDto(
                            e.Id,
                            e.Title,
                            e.StartUtc,
                            e.EndUtc,
                            e.RoomId,
                            e.Attendees.Select(a => new AttendeeDto(
                                    a.UserId,
                                    a.User.Email,
                                    a.Response
                                ))
                                .ToList()
                        ))
                        .FirstAsync();
                    await hub.Clients.All.SendAsync("event:created", dto);
                    return Results.Created($"/api/events/{dto.Id}", dto);
                }
            )
            .RequireAuthorization();

        // TODO : Make this locked for admins only or completely remove this function :)
        // DELETE /api/events
        g.MapDelete(
                "/delete",
                //[Authorize(Roles = "Admin")]
                async (AppDbContext db) =>
                {
                    // Delete children first if no cascade
                    await db.Events.ExecuteDeleteAsync();

                    //await db.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('dbo.Events', RESEED, 0);");

                    return Results.NoContent();
                }
            )
            .RequireAuthorization();

        // TODO: Constrain this action to admins or users that own the event
        g.MapDelete(
                "/delete/{event_id}",
                async (Guid event_id, AppDbContext db, ClaimsPrincipal user) =>
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
                }
            )
            .RequireAuthorization();

        // POST /api/events/{event_id}/notify
        g.MapPost(
                "/{event_id}/notify",
                async (
                    Guid event_id,
                    AppDbContext db,
                    IHubContext<CalendarHub> hub,
                    ClaimsPrincipal user
                ) =>
                {
                    // find event
                    var e = await db.Events.FindAsync(event_id);
                    if (e is null)
                        return Results.NotFound();

                    // resolve actor id from common claim types
                    var userIdString =
                        user.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)
                        ?? user.FindFirstValue("sub")
                        ?? user.FindFirstValue("id")
                        ?? user.FindFirstValue("uid");

                    if (
                        string.IsNullOrWhiteSpace(userIdString)
                        || !Guid.TryParse(userIdString, out var userId)
                    )
                    {
                        return Results.Unauthorized();
                    }

                    // prefer name from token, fallback to DB
                    var actorName =
                        user.FindFirstValue(System.Security.Claims.ClaimTypes.Name)
                        ?? user.FindFirstValue("name")
                        ?? user.Identity?.Name;

                    if (string.IsNullOrWhiteSpace(actorName))
                    {
                        actorName = await db
                            .Users.Where(u => u.Id == userId)
                            .Select(u => u.Name)
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
                        Timestamp = notif.Timestamp,
                    };

                    db.Notifications.Add(nEntity);
                    await db.SaveChangesAsync();

                    await hub.Clients.All.SendAsync("notification:created", notif);

                    return Results.Accepted();
                }
            )
            .RequireAuthorization();

        return g;
    }
}
