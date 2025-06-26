using Microsoft.EntityFrameworkCore.Migrations;

namespace TangoKultura.Migrations
{
    public partial class remove_county_from_events : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "County",
                table: "Events");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "County",
                table: "Events",
                type: "text",
                nullable: false,
                defaultValue: "Unknown");
        }
    }
}
