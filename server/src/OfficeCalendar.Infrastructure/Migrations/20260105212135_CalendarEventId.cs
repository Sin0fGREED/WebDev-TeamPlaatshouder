using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCalendar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarEventId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Events_CalendarEventId",
                table: "Attendees");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Attendees",
                table: "Attendees");

            migrationBuilder.DropIndex(
                name: "IX_Attendees_CalendarEventId",
                table: "Attendees");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Attendees");

            migrationBuilder.AlterColumn<Guid>(
                name: "CalendarEventId",
                table: "Attendees",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Attendees",
                table: "Attendees",
                columns: new[] { "CalendarEventId", "UserId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Events_CalendarEventId",
                table: "Attendees",
                column: "CalendarEventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Events_CalendarEventId",
                table: "Attendees");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Attendees",
                table: "Attendees");

            migrationBuilder.AlterColumn<Guid>(
                name: "CalendarEventId",
                table: "Attendees",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "EventId",
                table: "Attendees",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Attendees",
                table: "Attendees",
                columns: new[] { "EventId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Attendees_CalendarEventId",
                table: "Attendees",
                column: "CalendarEventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Events_CalendarEventId",
                table: "Attendees",
                column: "CalendarEventId",
                principalTable: "Events",
                principalColumn: "Id");
        }
    }
}
