namespace OfficeCalendar.Domain.Entities;

public class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public string Status { get; set; } = default!;

    // Nav - User can be employed at multiple companies
    public ICollection<Employee> Employments { get; set; } = new List<Employee>();
}
