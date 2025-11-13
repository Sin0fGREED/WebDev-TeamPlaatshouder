using OfficeCalendar.Domain.Entities;

namespace OfficeCalendar.Application.DTOs;

public record EventDto(Guid Id, string Title, DateTime StartUtc, DateTime EndUtc, Guid? roomId)
{
    public EventDto(CalendarEvent e) : this(e.Id, e.Title, e.StartUtc, e.EndUtc, e.RoomId) { }
}

public record CreateEventDto(string Title, string Description, DateTime StartUtc, DateTime EndUtc, List<Attendee> Attendees, Guid? RoomId = null);

public record UpdateEventDto(string Title, DateTime StartUtc, DateTime EndUtc, Guid? RoomId = null);
