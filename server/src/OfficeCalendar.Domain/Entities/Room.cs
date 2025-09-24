namespace OfficeCalendar.Domain.Entities;

public sealed class Room
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public int Capacity { get; set; } = 0;

    // nav
    public ICollection<CalendarEvent> Events { get; set; } = new List<CalendarEvent>();
}
