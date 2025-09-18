using OfficeCalendar.Domain.Entities;

namespace OfficeCalendar.Application.DTOs;

public record EventDto(Guid Id, string Title, DateTime StartUtc, DateTime EndUtc, Guid? roomId)
{
    public EventDto(CalendarEvent e) : this(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId) { }
}

public record CreateEventDto(string Title, DateTime StartUtc, DateTime EndUtc, Guid? RoomId = null);

public record UpdateEventDto(string Title, DateTime StartUtc, DateTime EndUtc, Guid? RoomId = null);
