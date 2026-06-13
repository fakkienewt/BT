using Microsoft.AspNetCore.Mvc;
using backend.Database;
using backend.DTO;
using MySql.Data.MySqlClient;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class CartController : ControllerBase
{
    private readonly DbHelper _dbHelper;

    public CartController(DbHelper dbHelper)
    {
        _dbHelper = dbHelper;
    }

    [HttpGet("cart/{userId}")]
    public async Task<IActionResult> GetCart(int userId)
    {
        var cartItems = new List<CartDTO>();

        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = @"
            SELECT c.Id, c.UserId, c.ProductId, c.Quantity, c.AddedAt,
                   p.Title as ProductTitle, p.Price as ProductPrice, p.Brand as ProductBrand,
                   pi.ImageUrl as ProductImage
            FROM Cart c
            INNER JOIN Products p ON c.ProductId = p.Id
            LEFT JOIN ProductImages pi ON p.Id = pi.ProductId AND pi.OrderIndex = 0
            WHERE c.UserId = @userId
            ORDER BY c.AddedAt DESC";

        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@userId", userId);

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var cartItem = new CartDTO
            {
                Id = Convert.ToInt32(reader["Id"]),
                UserId = Convert.ToInt32(reader["UserId"]),
                ProductId = Convert.ToInt32(reader["ProductId"]),
                Quantity = Convert.ToInt32(reader["Quantity"]),
                ProductTitle = reader["ProductTitle"]?.ToString() ?? "",
                ProductPrice = Convert.ToDecimal(reader["ProductPrice"]),
                ProductBrand = reader["ProductBrand"]?.ToString() ?? "",
                ProductImage = reader["ProductImage"]?.ToString() ?? "",
                AddedDate = Convert.ToDateTime(reader["AddedAt"])
            };
            cartItems.Add(cartItem);
        }

        return Ok(cartItems);
    }

    [HttpPost("cart/{userId}/add")]
    public async Task<IActionResult> AddToCart(int userId, [FromBody] AddToCartRequest request)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string checkSql = "SELECT Id, Quantity FROM Cart WHERE UserId = @userId AND ProductId = @productId";
        using var checkCmd = new MySqlCommand(checkSql, connection);
        checkCmd.Parameters.AddWithValue("@userId", userId);
        checkCmd.Parameters.AddWithValue("@productId", request.ProductId);

        using var reader = await checkCmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            int currentQuantity = Convert.ToInt32(reader["Quantity"]);
            reader.Close();

            int newQuantity = currentQuantity + request.Quantity;

            string updateSql = "UPDATE Cart SET Quantity = @quantity WHERE UserId = @userId AND ProductId = @productId";
            using var updateCmd = new MySqlCommand(updateSql, connection);
            updateCmd.Parameters.AddWithValue("@quantity", newQuantity);
            updateCmd.Parameters.AddWithValue("@userId", userId);
            updateCmd.Parameters.AddWithValue("@productId", request.ProductId);

            await updateCmd.ExecuteNonQueryAsync();
        }
        else
        {
            reader.Close();
            string insertSql = @"
                INSERT INTO Cart (UserId, ProductId, Quantity, AddedAt) 
                VALUES (@userId, @productId, @quantity, NOW())";

            using var insertCmd = new MySqlCommand(insertSql, connection);
            insertCmd.Parameters.AddWithValue("@userId", userId);
            insertCmd.Parameters.AddWithValue("@productId", request.ProductId);
            insertCmd.Parameters.AddWithValue("@quantity", request.Quantity);

            await insertCmd.ExecuteNonQueryAsync();
        }

        return Ok(new { message = "Товар добавлен в корзину" });
    }

    [HttpPut("cart/{userId}/update")]
    public async Task<IActionResult> UpdateQuantity(int userId, [FromBody] UpdateCartRequest request)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        if (request.Quantity <= 0)
        {
            string deleteSql = "DELETE FROM Cart WHERE UserId = @userId AND ProductId = @productId";
            using var deleteCmd = new MySqlCommand(deleteSql, connection);
            deleteCmd.Parameters.AddWithValue("@userId", userId);
            deleteCmd.Parameters.AddWithValue("@productId", request.ProductId);

            int rowsAffected = await deleteCmd.ExecuteNonQueryAsync();
            if (rowsAffected == 0)
                return NotFound(new { message = "Товар не найден в корзине" });
        }
        else
        {
            string updateSql = "UPDATE Cart SET Quantity = @quantity WHERE UserId = @userId AND ProductId = @productId";
            using var updateCmd = new MySqlCommand(updateSql, connection);
            updateCmd.Parameters.AddWithValue("@quantity", request.Quantity);
            updateCmd.Parameters.AddWithValue("@userId", userId);
            updateCmd.Parameters.AddWithValue("@productId", request.ProductId);

            int rowsAffected = await updateCmd.ExecuteNonQueryAsync();
            if (rowsAffected == 0)
                return NotFound(new { message = "Товар не найден в корзине" });
        }

        return Ok(new { message = "Корзина обновлена" });
    }

    [HttpDelete("cart/{userId}/remove/{productId}")]
    public async Task<IActionResult> RemoveFromCart(int userId, int productId)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string deleteSql = "DELETE FROM Cart WHERE UserId = @userId AND ProductId = @productId";
        using var deleteCmd = new MySqlCommand(deleteSql, connection);
        deleteCmd.Parameters.AddWithValue("@userId", userId);
        deleteCmd.Parameters.AddWithValue("@productId", productId);

        int rowsAffected = await deleteCmd.ExecuteNonQueryAsync();

        if (rowsAffected == 0)
            return NotFound(new { message = "Товар не найден в корзине" });

        return Ok(new { message = "Товар удален из корзины" });
    }

    [HttpDelete("cart/{userId}/clear")]
    public async Task<IActionResult> ClearCart(int userId)
    {
        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string deleteSql = "DELETE FROM Cart WHERE UserId = @userId";
        using var deleteCmd = new MySqlCommand(deleteSql, connection);
        deleteCmd.Parameters.AddWithValue("@userId", userId);

        await deleteCmd.ExecuteNonQueryAsync();

        return Ok(new { message = "Корзина очищена" });
    }
}