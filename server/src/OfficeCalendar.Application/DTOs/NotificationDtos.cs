using System;

namespace OfficeCalendar.Application.DTOs;

public record NotificationDto(Guid Id, Guid ActorId, string ActorName, string Action, string Message, Guid? EventId, DateTime Timestamp, bool IsRead);
