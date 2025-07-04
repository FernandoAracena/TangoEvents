using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using TangoKultura.Data;
using TangoKultura.Helpers;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.HttpOverrides;


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

builder.Services.AddControllersWithViews().AddJsonOptions(options =>
{
    // options.JsonSerializerOptions.Converters.Add(new TangoKultura.Helpers.DateTimeConverter());
});

builder.Services.AddControllers(); // Habilitar controladores API

// Configurar CORS para permitir peticiones desde React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .WithOrigins("http://localhost:3000", "http://localhost:8080")
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.ExpireTimeSpan = TimeSpan.FromHours(1); // Expira en 1 hora
    options.SlidingExpiration = false; // No renueva automáticamente
    options.Events.OnRedirectToLogin = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = 403;
            return Task.CompletedTask;
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
});

// Add JWT authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "JwtBearer";
    options.DefaultChallengeScheme = "JwtBearer";
})
.AddJwtBearer("JwtBearer", options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

var app = builder.Build();

// Middleware para detectar HTTPS detrás de proxy (Railway)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor,
    KnownNetworks = { }, // Trust all networks
    KnownProxies = { }
});

// Forzar scheme HTTPS si el request original fue HTTPS
app.Use((context, next) =>
{
    if (context.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto) && proto == "https")
    {
        context.Request.Scheme = "https";
    }
    return next();
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    // app.UseExceptionHandler("/Events/Error"); // Obsolete MVC error handler
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Usar CORS
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

// app.MapControllerRoute(
//     name: "default",
//     pattern: "{controller=Events}/{action=Index}/{id?}");
app.MapRazorPages();
app.MapControllers(); // Mapear controladores API

var scope = app.Services.CreateScope();

// Initialize Identity roles and manage data
var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
var roleInitializer = new RoleInitializer(roleManager, userManager);
await roleInitializer.SeedRoles();
await DataHelper.ManageDataAsync(scope.ServiceProvider);

// Fallback para SPA React: cualquier ruta no manejada devuelve index.html
app.MapFallbackToFile("index.html");

/*var env = app.Environment;

app.UseSpa(spa =>
{
    spa.Options.SourcePath = "clientapp";
    if (env.IsDevelopment())
    {
        spa.UseReactDevelopmentServer(npmScript: "start");
    }
});*/

// Redirigir HTTP a HTTPS solo si el request original fue HTTP (usando X-Forwarded-Proto)
if (!app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
        var forwardedProto = context.Request.Headers["X-Forwarded-Proto"].ToString();
        if (!context.Request.IsHttps && forwardedProto != "https")
        {
            var withHttps = "https://" + context.Request.Host + context.Request.Path + context.Request.QueryString;
            context.Response.Redirect(withHttps, permanent: true);
            return;
        }
        await next();
    });
}

app.Run();
