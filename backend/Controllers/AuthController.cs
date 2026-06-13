using Microsoft.AspNetCore.Mvc;
using backend.Database;
using backend.Models;
using MySql.Data.MySqlClient;
using BCrypt.Net;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DbHelper _dbHelper;

    public AuthController(DbHelper dbHelper)
    {
        _dbHelper = dbHelper;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegistDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required" });

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Password is required" });

        if (string.IsNullOrWhiteSpace(dto.Username))
            return BadRequest(new { message = "Username is required" });

        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string checkSql = "SELECT COUNT(*) FROM Users WHERE Email = @email";
        using var checkCmd = new MySqlCommand(checkSql, connection);
        checkCmd.Parameters.AddWithValue("@email", dto.Email);

        int count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
        if (count > 0)
            return BadRequest(new { message = "Email already exists" });

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        string insertSql = @"
            INSERT INTO Users (Email, PasswordHash, Username, PhoneNumber, DeliveryAddress)
            VALUES (@email, @passwordHash, @username, @phoneNumber, @deliveryAddress);
            SELECT LAST_INSERT_ID();";

        using var insertCmd = new MySqlCommand(insertSql, connection);
        insertCmd.Parameters.AddWithValue("@email", dto.Email);
        insertCmd.Parameters.AddWithValue("@passwordHash", passwordHash);
        insertCmd.Parameters.AddWithValue("@username", dto.Username);
        insertCmd.Parameters.AddWithValue("@phoneNumber", dto.PhoneNumber ?? (object)DBNull.Value);
        insertCmd.Parameters.AddWithValue("@deliveryAddress", dto.DeliveryAddress ?? (object)DBNull.Value);

        int newId = Convert.ToInt32(await insertCmd.ExecuteScalarAsync());

        return Ok(new
        {
            message = "Registration successful",
            userId = newId,
            email = dto.Email,
            username = dto.Username
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] RegistDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required" });

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Password is required" });

        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = "SELECT Id, Email, PasswordHash, Username FROM Users WHERE Email = @email";
        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@email", dto.Email);

        using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return Unauthorized(new { message = "Invalid email or password" });

        var userId = Convert.ToInt32(reader["Id"]);
        var email = reader["Email"].ToString();
        var passwordHash = reader["PasswordHash"].ToString();
        var username = reader["Username"].ToString();

        bool isValidPassword = BCrypt.Net.BCrypt.Verify(dto.Password, passwordHash);
        if (!isValidPassword)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(new
        {
            message = "Login successful",
            userId = userId,
            email = email,
            username = username
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = "SELECT Id, Email, Username, PhoneNumber, DeliveryAddress, AvatarUrl FROM Users WHERE Id = @id";
        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@id", id);

        using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return NotFound(new { message = "User not found" });

        var user = new ModelUser
        {
            Id = Convert.ToInt32(reader["Id"]),
            Email = reader["Email"].ToString(),
            Username = reader["Username"].ToString(),
            PhoneNumber = reader["PhoneNumber"] == DBNull.Value ? null : reader["PhoneNumber"].ToString(),
            DeliveryAddress = reader["DeliveryAddress"] == DBNull.Value ? null : reader["DeliveryAddress"].ToString(),
            AvatarUrl = reader["AvatarUrl"] == DBNull.Value ? null : reader["AvatarUrl"].ToString()
        };

        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] RegistDTO dto)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = @"
            UPDATE Users 
            SET Username = @username,
                Email = @email,
                PhoneNumber = @phoneNumber,
                DeliveryAddress = @deliveryAddress
            WHERE Id = @id";

        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@username", dto.Username);
        cmd.Parameters.AddWithValue("@email", dto.Email);
        cmd.Parameters.AddWithValue("@phoneNumber", dto.PhoneNumber ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@deliveryAddress", dto.DeliveryAddress ?? (object)DBNull.Value);

        int rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected == 0)
            return NotFound(new { message = "User not found" });

        return Ok(new { message = "Profile updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string checkSql = "SELECT COUNT(*) FROM Users WHERE Id = @id";
        using var checkCmd = new MySqlCommand(checkSql, connection);
        checkCmd.Parameters.AddWithValue("@id", id);

        int count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
        if (count == 0)
            return NotFound(new { message = "User not found" });

        string deleteSql = "DELETE FROM Users WHERE Id = @id";
        using var deleteCmd = new MySqlCommand(deleteSql, connection);
        deleteCmd.Parameters.AddWithValue("@id", id);

        await deleteCmd.ExecuteNonQueryAsync();

        return Ok(new { message = "User deleted successfully" });
    }

    [HttpPost("{userId}/avatar")]
    public async Task<IActionResult> UploadAvatar(int userId, IFormFile avatar)
    {
        if (avatar == null || avatar.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg", "image/gif" };
        if (!allowedTypes.Contains(avatar.ContentType))
            return BadRequest(new { message = "Only images are allowed (jpeg, png, gif)" });

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileExtension = Path.GetExtension(avatar.FileName);
        var fileName = $"{userId}_{DateTime.Now.Ticks}{fileExtension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await avatar.CopyToAsync(stream);
        }

        var avatarUrl = $"/avatars/{fileName}";

        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string updateSql = "UPDATE Users SET AvatarUrl = @avatarUrl WHERE Id = @userId";
        using var updateCmd = new MySqlCommand(updateSql, connection);
        updateCmd.Parameters.AddWithValue("@avatarUrl", avatarUrl);
        updateCmd.Parameters.AddWithValue("@userId", userId);

        await updateCmd.ExecuteNonQueryAsync();

        return Ok(new { avatarUrl = avatarUrl });
    }

    [HttpGet("{userId}/avatar")]
    public async Task<IActionResult> GetAvatar(int userId)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = "SELECT AvatarUrl FROM Users WHERE Id = @userId";
        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@userId", userId);

        var avatarUrl = await cmd.ExecuteScalarAsync();
        return Ok(new { avatarUrl = avatarUrl?.ToString() });
    }
}