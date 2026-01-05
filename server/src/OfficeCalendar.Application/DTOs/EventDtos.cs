using OfficeCalendar.Domain.Entities;

namespace OfficeCalendar.Application.DTOs;

public record EventDto(
    Guid Id,
    string Title,
    DateTime StartUtc,
    DateTime EndUtc,
    Guid? roomId,
    List<AttendeeDto>? attendees
);

public record CreateEventDto(
    string Title,
    string Description,
    DateTime StartUtc,
    DateTime EndUtc,
    List<CreateAttendeeDto> Attendees,
    Guid? RoomId = null
);

public record UpdateEventDto(string Title, DateTime StartUtc, DateTime EndUtc, Guid? RoomId = null);

public record AttendeeDto(Guid UserId, string Email, AttendeeResponse Response);

public record CreateAttendeeDto(Guid UserId);
