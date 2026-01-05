using System;

namespace OfficeCalendar.Domain.Entities;

public sealed class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Who performed the action
    public Guid ActorId { get; set; }
    public string ActorName { get; set; } = default!;

    // Optional recipient (null = broadcast/global)
    public Guid? RecipientId { get; set; }

    public string Action { get; set; } = default!;
    public string Message { get; set; } = default!;

    // Optional related event
    public Guid? EventId { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
