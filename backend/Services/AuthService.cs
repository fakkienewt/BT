using backend.Database;
using backend.Models;
using MySql.Data.MySqlClient;

namespace backend.Services
{
    public class AuthService
    {
        private readonly DbHelper _dbHelper;

        public AuthService(DbHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<ModelUser?> GetUserById(int id)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            string sql = "SELECT Id, Email, Username, PhoneNumber, DeliveryAddress FROM Users WHERE Id = @id";
            using var cmd = new MySqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("@id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return new ModelUser
            {
                Id = Convert.ToInt32(reader["Id"]),
                Email = reader["Email"].ToString() ?? string.Empty,
                Username = reader["Username"].ToString() ?? string.Empty,
                PhoneNumber = reader["PhoneNumber"] == DBNull.Value ? null : reader["PhoneNumber"].ToString(),
                DeliveryAddress = reader["DeliveryAddress"] == DBNull.Value ? null : reader["DeliveryAddress"].ToString()
            };
        }

        public async Task<bool> UpdateUser(int id, RegistDTO dto)
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
            return rowsAffected > 0;
        }
    }
}