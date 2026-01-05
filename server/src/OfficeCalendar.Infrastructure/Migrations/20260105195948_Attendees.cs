using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCalendar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Attendees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Employees_EmployeeId",
                table: "Attendees");

            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Events_EventId",
                table: "Attendees");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Employees_OrganizerId",
                table: "Events");

            migrationBuilder.DropTable(
                name: "OfficeDays");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.RenameColumn(
                name: "EmployeeId",
                table: "Attendees",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Attendees_EmployeeId",
                table: "Attendees",
                newName: "IX_Attendees_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Response",
                table: "Attendees",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<Guid>(
                name: "CalendarEventId",
                table: "Attendees",
                type: "uniqueidentifier",
                nullable: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Users_UserId",
                table: "Attendees",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Users_OrganizerId",
                table: "Events",
                column: "OrganizerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Events_CalendarEventId",
                table: "Attendees");

            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Users_UserId",
                table: "Attendees");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Users_OrganizerId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Attendees_CalendarEventId",
                table: "Attendees");

            migrationBuilder.DropColumn(
                name: "CalendarEventId",
                table: "Attendees");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Attendees",
                newName: "EmployeeId");

            migrationBuilder.RenameIndex(
                name: "IX_Attendees_UserId",
                table: "Attendees",
                newName: "IX_Attendees_EmployeeId");

            migrationBuilder.AlterColumn<string>(
                name: "Response",
                table: "Attendees",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OfficeDays",
                columns: table => new
                {
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfficeDays", x => new { x.EmployeeId, x.Date });
                    table.ForeignKey(
                        name: "FK_OfficeDays_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserId",
                table: "Employees",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Employees_EmployeeId",
                table: "Attendees",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Events_EventId",
                table: "Attendees",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Employees_OrganizerId",
                table: "Events",
                column: "OrganizerId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
