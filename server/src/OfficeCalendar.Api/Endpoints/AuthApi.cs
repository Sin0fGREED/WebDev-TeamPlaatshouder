using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OfficeCalendar.Application.DTOs;
using OfficeCalendar.Domain.Entities;
using OfficeCalendar.Infrastructure.Persistence;

namespace OfficeCalendar.Api.Endpoints;

public static class AuthApi
{
    public static RouteGroupBuilder MapAuthApi(this RouteGroupBuilder g)
    {
        // POST /api/auth/register
        g.MapPost(
            "/register",
            async (AppDbContext db, IPasswordHasher<AppUser> hasher, RegisterDto dto) =>
            {
                var email = dto.Email.Trim();
                var exists = await db.Users.AnyAsync(u => u.Email == email);
                if (exists)
                    return Results.Conflict("Email already registered.");

                var user = new AppUser { Email = email, IsActive = true };
                user.PasswordHash = hasher.HashPassword(user, dto.Password);

                db.Users.Add(user);
                await db.SaveChangesAsync();

                return Results.Created($"/api/users/{user.Id}", new { user.Id, user.Email });
            }
        );

        // POST /api/auth/login
        g.MapPost(
            "/login",
            async (
                AppDbContext db,
                IPasswordHasher<AppUser> hasher,
                IConfiguration cfg,
                LoginDto dto
            ) =>
            {
                var email = dto.Email.Trim();
                var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email && u.IsActive);
                if (user is null)
                    return Results.Unauthorized();

                var result = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
                if (result == PasswordVerificationResult.Failed)
                    return Results.Unauthorized();

                var token = CreateJwt(user, cfg);
                return Results.Ok(
                    new
                    {
                        token,
                        tokenType = "Bearer",
                        expiresIn = 3600,
                    }
                );
            }
        );

        return g;
    }

    // ---- helpers ----
    private static string CreateJwt(AppUser user, IConfiguration cfg)
    {
        // pull values from configuration (appsettings.json / env)
        var issuer = cfg["Jwt:Issuer"]!;
        var audience = cfg["Jwt:Audience"]!;
        var keyStr = cfg["Jwt:Key"]!; // 32+ chars recommended
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            // add roles/permissions later if needed:
            // new Claim(ClaimTypes.Role, "Employee"),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
