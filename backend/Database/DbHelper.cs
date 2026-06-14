using MySql.Data.MySqlClient;

namespace backend.Database;

public class DbHelper
{
    private readonly string _connectionString =
        "Server=localhost;Database=BT;Uid=root;Pwd=;";

    public MySqlConnection GetConnection()
    {
        return new MySqlConnection(_connectionString);
    }
}
