using Microsoft.EntityFrameworkCore.Migrations;

namespace TangoKultura.Migrations
{
    public partial class add_city_county_to_events : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Events",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "County",
                table: "Events",
                type: "text",
                nullable: false,
                defaultValue: "Unknown");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "County",
                table: "Events");
        }
    }
}
