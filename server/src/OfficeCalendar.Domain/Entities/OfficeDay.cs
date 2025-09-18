namespace OfficeCalendar.Domain.Entities;

public sealed class OfficeDay
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = default!;

    // EF Core 8+ can map DateOnly to SQL Server `date`.
    public DateOnly Date { get; set; }

    // "Remote" | "InOffice" | "OOO"
    public string Status { get; set; } = "InOffice";
}
