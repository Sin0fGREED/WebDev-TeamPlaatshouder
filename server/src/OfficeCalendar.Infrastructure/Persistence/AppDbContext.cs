using Microsoft.EntityFrameworkCore;
using OfficeCalendar.Domain.Entities;

namespace OfficeCalendar.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<CalendarEvent> Events => Set<CalendarEvent>();
    public DbSet<Attendee> Attendees => Set<Attendee>();
    public DbSet<OfficeDay> OfficeDays => Set<OfficeDay>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationDismissal> NotificationDismissals => Set<NotificationDismissal>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // Attendee composite key
        b.Entity<Attendee>()
            .HasKey(a => new { a.EventId, a.EmployeeId });

        b.Entity<Attendee>()
            .HasOne(a => a.Event)
            .WithMany(e => e.Attendees)
            .HasForeignKey(a => a.EventId);

        b.Entity<Attendee>()
            .HasOne(a => a.Employee)
            .WithMany(emp => emp.Attending)
            .HasForeignKey(a => a.EmployeeId);

        // CalendarEvent relationships
        b.Entity<CalendarEvent>()
            .HasOne(e => e.Organizer)
            .WithMany(emp => emp.OrganizedEvents)
            .HasForeignKey(e => e.OrganizerId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<CalendarEvent>()
            .HasOne(e => e.Room)
            .WithMany(r => r.Events)
            .HasForeignKey(e => e.RoomId)
            .OnDelete(DeleteBehavior.SetNull);

        // OfficeDay composite key
        b.Entity<OfficeDay>()
            .HasKey(od => new { od.EmployeeId, od.Date });

        b.Entity<OfficeDay>()
            .Property(od => od.Status)
            .HasMaxLength(20);

        // Unique constraint on Email
        b.Entity<AppUser>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Notifications
        b.Entity<Notification>()
            .HasKey(n => n.Id);

        b.Entity<Notification>()
            .HasIndex(n => n.RecipientId);

        b.Entity<Notification>()
            .Property(n => n.Message)
            .IsRequired();

        b.Entity<NotificationDismissal>()
            .HasKey(nd => new { nd.NotificationId, nd.UserId });

        b.Entity<NotificationDismissal>()
            .HasOne(nd => nd.Notification)
            .WithMany()
            .HasForeignKey(nd => nd.NotificationId)
            .OnDelete(DeleteBehavior.Cascade);

    }
}
