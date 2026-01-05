using System;

namespace OfficeCalendar.Domain.Entities;

public sealed class NotificationDismissal
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    // Track whether the user has read this notification (or dismissed it)
    public bool IsRead { get; set; } = true;
    public DateTime DismissedAt { get; set; } = DateTime.UtcNow;

    public Notification? Notification { get; set; }
}
