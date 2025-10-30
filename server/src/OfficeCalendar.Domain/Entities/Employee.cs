namespace OfficeCalendar.Domain.Entities;
public sealed class Employee
{
    public Guid Id { get; set; } = default!;
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Role { get; set; } = "Employee";
    public bool IsActive { get; set; } = true;

    // nav
    public ICollection<CalendarEvent> OrganizedEvents { get; set; } = new List<CalendarEvent>();
    public ICollection<Attendee> Attending { get; set; } = new List<Attendee>();
}
