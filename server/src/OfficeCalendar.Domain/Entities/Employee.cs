namespace OfficeCalendar.Domain.Entities;
public sealed class Employee
{
    public Guid Id { get; set; } = default!;
    public string Role { get; set; } = "Employee";

    // Foreign Keys
    public Guid UserId { get; set; }

    // Nav properties
    public AppUser User { get; set; } = default!;

    // Nav collections
    public ICollection<CalendarEvent> OrganizedEvents { get; set; } = new List<CalendarEvent>();
    public ICollection<Attendee> Attending { get; set; } = new List<Attendee>();
}
