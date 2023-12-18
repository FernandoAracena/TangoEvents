using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TangoKultura.Migrations
{
    public partial class EndsDatefield : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EndsDate",
                table: "Events",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndsDate",
                table: "Events");
        }
    }
}
