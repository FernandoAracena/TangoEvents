using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using TangoKultura.Data;
using TangoKultura.Helpers;
using Microsoft.Extensions.Hosting;


var builder = WebApplication.CreateBuilder(args);

var connectionString = ConnectionHelper.GetConnectionString(builder.Configuration);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Get the connection string from the configuration
    options.UseNpgsql(connectionString);
});

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Events/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Events}/{action=Index}/{id?}");
app.MapRazorPages();

var scope = app.Services.CreateScope();

// Apply database migrations
var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
dbContext.Database.Migrate();

// Initialize Identity roles and manage data
var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
var roleInitializer = new RoleInitializer(roleManager, userManager);
await roleInitializer.SeedRoles();
await DataHelper.ManageDataAsync(scope.ServiceProvider);

/*var env = app.Environment;

app.UseSpa(spa =>
{
    spa.Options.SourcePath = "clientapp";
    if (env.IsDevelopment())
    {
        spa.UseReactDevelopmentServer(npmScript: "start");
    }
});*/


app.Run();
