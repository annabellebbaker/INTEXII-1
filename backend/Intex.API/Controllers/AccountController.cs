using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Intex.API.Controllers
{
    [Route("Account")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;

        public AccountController(
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
        }

        // DTO for registration
        public class RegisterDto
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        // Register a new user (create account)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            var user = new IdentityUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description });
                return BadRequest(new { errors });
            }

            return Ok(new { message = "Registration successful." });
        }

        // Login using Google
        [HttpGet("ExternalLogin")]
        public IActionResult ExternalLogin(string provider, string returnUrl = "https://salmon-glacier-03e509d1e.6.azurestaticapps.net/browse")
        {
            var redirectUrl = $"{Request.Scheme}://{Request.Host}/Account/ExternalLoginCallback?returnUrl={Uri.EscapeDataString(returnUrl)}";

            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, "/Account/ExternalLoginCallback");
            properties.Items["returnUrl"] = returnUrl;
            return Challenge(properties, provider);
        }

        // Login with Google
        [HttpGet("ExternalLoginCallback")]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = "https://salmon-glacier-03e509d1e.6.azurestaticapps.net/browse")
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null) return Redirect("/login"); // fallback

            var result = await _signInManager.ExternalLoginSignInAsync(
                info.LoginProvider, info.ProviderKey, isPersistent: false);

            if (result.Succeeded)
            {
                return Redirect(returnUrl);
            }

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var user = new IdentityUser { UserName = email, Email = email };
            var createResult = await _userManager.CreateAsync(user);

            if (createResult.Succeeded)
            {
                await _userManager.AddLoginAsync(user, info);
                await _signInManager.SignInAsync(user, isPersistent: false);
                return Redirect(returnUrl);
            }

            return BadRequest("Error logging in with external provider.");
        }

        // Get the user's email
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUserEmail()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(new { email = user.Email });
        }

        // Get any user roles the user is assigned
        [HttpGet("roles")]
        public async Task<IActionResult> GetUserRoles()
        {
            var user = await _userManager.GetUserAsync(User);
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles);
        }
    }
}
