using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCalendar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class renamed_CalendarEventId_to_EventId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Events_CalendarEventId",
                table: "Attendees");

            migrationBuilder.RenameColumn(
                name: "CalendarEventId",
                table: "Attendees",
                newName: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Events_EventId",
                table: "Attendees",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Events_EventId",
                table: "Attendees");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "Attendees",
                newName: "CalendarEventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Events_CalendarEventId",
                table: "Attendees",
                column: "CalendarEventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
