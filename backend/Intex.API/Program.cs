using System.Security.Claims;
using Intex.API.Controllers;
using Intex.API.Data;
using Intex.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext files
builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("MOVIEDB_CONNECTION_STRING")));
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("IDENTITYDB_CONNECTION_STRING")));

// third party authentication
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = Environment.GetEnvironmentVariable("Authentication:Google:ClientId");
        options.ClientSecret = Environment.GetEnvironmentVariable("Authentication:Google:ClientSecret");
    });

builder.Services.AddAuthorization();
// Authorization Policy to require Administrator role
// Authorization Policy to require Administrator role
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdministratorRole", policy =>
        policy.RequireRole("Administrator"));
});

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
builder.Services.AddSingleton<IEmailSender<IdentityUser>, NoOpEmailSender<IdentityUser>>();

// This makes sure roles are included in the cookie every time
builder.Services.AddScoped<IUserClaimsPrincipalFactory<IdentityUser>, UserClaimsPrincipalFactory<IdentityUser, IdentityRole>>();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
    options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Email;
    options.ClaimsIdentity.RoleClaimType = ClaimTypes.Role;

    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 13;
    options.Password.RequiredUniqueChars = 1;
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None; // Change after adding https for production
    options.Cookie.Name = ".AspNetCore.Identity.Application";
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    options.Events.OnSigningIn = async context =>
    {
        var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<IdentityUser>>();
        var user = await userManager.GetUserAsync(context.Principal);

        if (user != null)
        {
            var roles = await userManager.GetRolesAsync(user);
            var identity = (ClaimsIdentity)context.Principal.Identity;

            foreach (var role in roles)
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }
    };
});


// Configure CORS
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend",
    policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://salmon-glacier-03e509d1e.6.azurestaticapps.net/")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    }));


builder.Logging.ClearProviders();
builder.Logging.AddConsole();

try {
   var app = builder.Build(); 
   
   // Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapIdentityApi<IdentityUser>();

// Route to log out of the website
app.MapPost("/logout", async (HttpContext context, SignInManager<IdentityUser> signInManager) =>
{
    await signInManager.SignOutAsync();

    // Ensure authentication cookie is removed
    context.Response.Cookies.Delete(".AspNetCore.Identity.Application", new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None
    });

    return Results.Ok(new { message = "Logout successful" });
}).RequireAuthorization();

// Use the user's email address to let the server know the user is logged in
app.MapGet("/pingauth", (ClaimsPrincipal user) =>
{
    if (!user.Identity?.IsAuthenticated ?? false)
    {
        return Results.Unauthorized();
    }

    var email = user.FindFirstValue(ClaimTypes.Email) ?? "unknown@example.com"; // Ensure it's never null
    return Results.Json(new { email = email }); // Return as JSON
}).RequireAuthorization();

    app.Run();

}

catch (Exception ex)
{
    Console.Error.WriteLine("Unhandled startup exception:");
    Console.Error.WriteLine(ex);

    var logger = LoggerFactory.Create(logging => logging.AddConsole()).CreateLogger("Startup");
    logger.LogCritical(ex, "Unhandled exception during startup");

    throw;
}


