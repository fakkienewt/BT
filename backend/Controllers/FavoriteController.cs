using Microsoft.AspNetCore.Mvc;
using backend.Database;
using backend.DTO;
using MySql.Data.MySqlClient;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class FavoriteController : ControllerBase
{
    private readonly DbHelper _dbHelper;

    public FavoriteController(DbHelper dbHelper)
    {
        _dbHelper = dbHelper;
    }

    [HttpGet("favorites/{userId}")]
    public async Task<IActionResult> GetFavorites(int userId)
    {
        var favorites = new List<FavoriteDTO>();

        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = @"
            SELECT f.Id, f.UserId, f.ProductId, f.CreatedAt,
                   p.Title as ProductTitle, p.Price as ProductPrice, p.Brand as ProductBrand,
                   pi.ImageUrl as ProductImage
            FROM Favorites f
            INNER JOIN Products p ON f.ProductId = p.Id
            LEFT JOIN ProductImages pi ON p.Id = pi.ProductId AND pi.OrderIndex = 0
            WHERE f.UserId = @userId
            ORDER BY f.CreatedAt DESC";

        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@userId", userId);

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            favorites.Add(new FavoriteDTO
            {
                Id = Convert.ToInt32(reader["Id"]),
                UserId = Convert.ToInt32(reader["UserId"]),
                ProductId = Convert.ToInt32(reader["ProductId"]),
                ProductTitle = reader["ProductTitle"]?.ToString() ?? "",
                ProductPrice = Convert.ToDecimal(reader["ProductPrice"]),
                ProductBrand = reader["ProductBrand"]?.ToString() ?? "",
                ProductImage = reader["ProductImage"]?.ToString() ?? "",
                CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
            });
        }

        return Ok(favorites);
    }

    [HttpPost("favorites/{userId}/add")]
    public async Task<IActionResult> AddToFavorite(int userId, [FromBody] AddToFavoriteRequest request)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string checkSql = "SELECT Id FROM Favorites WHERE UserId = @userId AND ProductId = @productId";
        using var checkCmd = new MySqlCommand(checkSql, connection);
        checkCmd.Parameters.AddWithValue("@userId", userId);
        checkCmd.Parameters.AddWithValue("@productId", request.ProductId);

        var exists = await checkCmd.ExecuteScalarAsync();

        if (exists != null)
        {
            return Ok(new { message = "Товар уже в избранном" });
        }

        string insertSql = "INSERT INTO Favorites (UserId, ProductId, CreatedAt) VALUES (@userId, @productId, NOW())";
        using var insertCmd = new MySqlCommand(insertSql, connection);
        insertCmd.Parameters.AddWithValue("@userId", userId);
        insertCmd.Parameters.AddWithValue("@productId", request.ProductId);

        await insertCmd.ExecuteNonQueryAsync();

        return Ok(new { message = "Товар добавлен в избранное" });
    }

    [HttpDelete("favorites/{userId}/remove/{productId}")]
    public async Task<IActionResult> RemoveFromFavorite(int userId, int productId)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string deleteSql = "DELETE FROM Favorites WHERE UserId = @userId AND ProductId = @productId";
        using var deleteCmd = new MySqlCommand(deleteSql, connection);
        deleteCmd.Parameters.AddWithValue("@userId", userId);
        deleteCmd.Parameters.AddWithValue("@productId", productId);

        int rowsAffected = await deleteCmd.ExecuteNonQueryAsync();

        if (rowsAffected == 0)
            return NotFound(new { message = "Товар не найден в избранном" });

        return Ok(new { message = "Товар удален из избранного" });
    }
}