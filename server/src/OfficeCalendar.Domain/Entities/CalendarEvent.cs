namespace OfficeCalendar.Domain.Entities;

public sealed class CalendarEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }

    public Guid OrganizerId { get; set; }
    public Employee? Organizer { get; set; }

    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }

    public string? RecurrenceRule { get; set; } // RFC5545
    public string Visibility { get; set; } = "Public";

    public List<Attendee> Attendees { get; set; } = new();
}

public sealed class Attendee
{
    public Guid CalendarEventId { get; set; }
    public CalendarEvent Event { get; set; } = default!;

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = default!;

    public string Response { get; set; } = "Maybe";
}
