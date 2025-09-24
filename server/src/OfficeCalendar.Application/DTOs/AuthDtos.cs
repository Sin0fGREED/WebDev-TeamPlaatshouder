namespace OfficeCalendar.Application.DTOs;

public record RegisterDto(string Email, string Password, string FirstName, string LastName);
public record LoginDto(string Email, string Password);
