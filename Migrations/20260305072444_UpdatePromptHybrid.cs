using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureNotesApp.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePromptHybrid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Prompts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OwnerId",
                table: "Prompts",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Prompts");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Prompts");
        }
    }
}
