namespace OfficeCalendar.Domain.Entities;

public sealed class CalendarEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }

    public Guid OrganizerId { get; set; }
    public AppUser? Organizer { get; set; }

    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }

    public string? RecurrenceRule { get; set; } // RFC5545
    public string Visibility { get; set; } = "Public";

    public ICollection<Attendee> Attendees { get; set; } = new List<Attendee>();
}
