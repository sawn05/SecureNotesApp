using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureNotesApp.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnerToTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OwnerName",
                table: "TodoTasks",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerName",
                table: "TodoTasks");
        }
    }
}
