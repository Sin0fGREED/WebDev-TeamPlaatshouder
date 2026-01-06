namespace OfficeCalendar.Domain.Entities;

public enum AttendeeResponse
{
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    Tentative = 3,
}

public sealed class Attendee
{
    public Guid CalendarEventId { get; set; }
    public CalendarEvent Event { get; set; } = default!;

    public Guid UserId { get; set; }
    public AppUser User { get; set; } = default!;

    public AttendeeResponse Response { get; set; } = AttendeeResponse.Pending;
}
