using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Domain.Entities;

namespace OfficeCalendar.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<CalendarEvent> Events => Set<CalendarEvent>();
    public DbSet<Attendee> Attendees => Set<Attendee>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationDismissal> NotificationDismissals => Set<NotificationDismissal>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // Attendee composite key
        b.Entity<Attendee>().HasKey(a => new { a.CalendarEventId, a.UserId });

        b.Entity<Attendee>()
            .HasOne(a => a.Event)
            .WithMany(e => e.Attendees)
            .HasForeignKey(a => a.CalendarEventId);

        // Make sure we convert the response enum to string
        b.Entity<Attendee>().Property(a => a.Response).HasConversion<string>().HasMaxLength(20);

        b.Entity<CalendarEvent>()
            .HasOne(e => e.Organizer)
            .WithMany(u => u.OrganizedEvents)
            .HasForeignKey(e => e.OrganizerId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<CalendarEvent>()
            .HasOne(e => e.Room)
            .WithMany(r => r.Events)
            .HasForeignKey(e => e.RoomId)
            .OnDelete(DeleteBehavior.SetNull);

        // Unique constraint on Email
        b.Entity<AppUser>().HasIndex(u => u.Email).IsUnique();

        // Notifications
        b.Entity<Notification>().HasKey(n => n.Id);

        b.Entity<Notification>().HasIndex(n => n.RecipientId);

        b.Entity<Notification>().Property(n => n.Message).IsRequired();

        b.Entity<NotificationDismissal>().HasKey(nd => new { nd.NotificationId, nd.UserId });

        b.Entity<NotificationDismissal>()
            .HasOne(nd => nd.Notification)
            .WithMany()
            .HasForeignKey(nd => nd.NotificationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
