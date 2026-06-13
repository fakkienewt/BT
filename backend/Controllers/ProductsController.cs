using Microsoft.AspNetCore.Mvc;
using backend.Database;
using backend.Models;
using MySql.Data.MySqlClient;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class ProductsController : ControllerBase
{
    private readonly DbHelper _dbHelper;

    public ProductsController(DbHelper dbHelper)
    {
        _dbHelper = dbHelper;
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "API works!" });
    }

    [HttpGet("phones")]
    public async Task<IActionResult> GetPhones([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("phones", page, pageSize);
    }

    [HttpGet("laptops")]
    public async Task<IActionResult> GetLaptops([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("laptops", page, pageSize);
    }

    [HttpGet("computers")]
    public async Task<IActionResult> GetComputers([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("computers", page, pageSize);
    }

    [HttpGet("tablets")]
    public async Task<IActionResult> GetTablets([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("tablets", page, pageSize);
    }

    [HttpGet("tv")]
    public async Task<IActionResult> GetTVs([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("smart_televizory", page, pageSize);
    }

    [HttpGet("monitory")]
    public async Task<IActionResult> GetMonitory([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("monitory", page, pageSize);
    }

    [HttpGet("pristavki")]
    public async Task<IActionResult> GetPristavki([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("pristavki", page, pageSize);
    }

    [HttpGet("smart-watches")]
    public async Task<IActionResult> GetSmartWatches([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("smart_watches", page, pageSize);
    }

    [HttpGet("fitness-bands")]
    public async Task<IActionResult> GetFitnessBands([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("fitness_bracelets", page, pageSize);
    }

    [HttpGet("gaming-keyboards")]
    public async Task<IActionResult> GetGamingKeyboards([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("gaming_keyboards", page, pageSize);
    }

    [HttpGet("gaming-consoles")]
    public async Task<IActionResult> GetGamingConsoles([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("gaming_consoles", page, pageSize);
    }

    [HttpGet("gaming-mice")]
    public async Task<IActionResult> GetGamingMice([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("gaming_mice", page, pageSize);
    }

    [HttpGet("microphones")]
    public async Task<IActionResult> GetMicrophones([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("microphones", page, pageSize);
    }

    [HttpGet("speakers")]
    public async Task<IActionResult> GetSpeakers([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("speakers", page, pageSize);
    }

    [HttpGet("headphones")]
    public async Task<IActionResult> GetHeadphones([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("headphones", page, pageSize);
    }

    [HttpGet("cables-chargers")]
    public async Task<IActionResult> GetCablesAndChargers([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("cables_chargers", page, pageSize);
    }

    [HttpGet("batteries")]
    public async Task<IActionResult> GetBatteries([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("batteries", page, pageSize);
    }

    [HttpGet("wireless-chargers")]
    public async Task<IActionResult> GetWirelessChargers([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return await GetProductsByCategory("wireless_chargers", page, pageSize);
    }

    private async Task<IActionResult> GetProductsByCategory(string category, int page, int pageSize)
    {
        int offset = (page - 1) * pageSize;
        var productsDict = new Dictionary<int, ModelProduct>();

        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = @"
            SELECT p.Id, p.Title, p.Price, p.Brand, p.Category, pi.ImageUrl
            FROM Products p
            LEFT JOIN ProductImages pi ON p.Id = pi.ProductId
            WHERE p.Category = @category
            ORDER BY p.Id, pi.OrderIndex
            LIMIT @pageSize OFFSET @offset";

        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@category", category);
        cmd.Parameters.AddWithValue("@pageSize", pageSize);
        cmd.Parameters.AddWithValue("@offset", offset);

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            int id = Convert.ToInt32(reader["Id"]);

            if (!productsDict.ContainsKey(id))
            {
                productsDict[id] = new ModelProduct
                {
                    Id = id,
                    Title = reader["Title"]?.ToString() ?? "",
                    Price = Convert.ToDecimal(reader["Price"]),
                    Brand = reader["Brand"]?.ToString() ?? "",
                    Category = reader["Category"]?.ToString() ?? "",
                    ImageUrl = new List<string>()
                };
            }

            string imageUrl = reader["ImageUrl"]?.ToString();
            if (!string.IsNullOrEmpty(imageUrl) && !productsDict[id].ImageUrl.Contains(imageUrl))
            {
                productsDict[id].ImageUrl.Add(imageUrl);
            }
        }

        return Ok(productsDict.Values.ToList());
    }

    [HttpGet("new")]
    public async Task<IActionResult> GetNewItems([FromQuery] int limit = 15)
    {
        var allowedCategories = new HashSet<string>
    {
        "phones", "laptops", "computers", "tablets", "smart_televizory",
        "monitory", "pristavki", "smart_watches", "fitness_bracelets",
        "gaming_keyboards", "gaming_consoles", "gaming_mice",
        "microphones", "speakers", "headphones", "cables_chargers",
        "batteries", "wireless_chargers"
    };

        var productsDict = new Dictionary<int, ModelProduct>();

        using var connection = _dbHelper.GetConnection();
        await connection.OpenAsync();

        string sql = @"
        SELECT p.Id, p.Title, p.Price, p.Brand, p.Category, pi.ImageUrl
        FROM Products p
        LEFT JOIN ProductImages pi ON p.Id = pi.ProductId
        WHERE p.Category IN (
            'phones', 'laptops', 'computers', 'tablets', 'smart_televizory',
            'monitory', 'pristavki', 'smart_watches', 'fitness_bracelets',
            'gaming_keyboards', 'gaming_consoles', 'gaming_mice',
            'microphones', 'speakers', 'headphones', 'cables_chargers',
            'batteries', 'wireless_chargers'
        )
        ORDER BY p.Id DESC
        LIMIT @limit";

        using var cmd = new MySqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            int id = Convert.ToInt32(reader["Id"]);

            if (!productsDict.ContainsKey(id))
            {
                productsDict[id] = new ModelProduct
                {
                    Id = id,
                    Title = reader["Title"]?.ToString() ?? "",
                    Price = Convert.ToDecimal(reader["Price"]),
                    Brand = reader["Brand"]?.ToString() ?? "",
                    Category = reader["Category"]?.ToString() ?? "",
                    ImageUrl = new List<string>()
                };
            }

            string imageUrl = reader["ImageUrl"]?.ToString();
            if (!string.IsNullOrEmpty(imageUrl) && !productsDict[id].ImageUrl.Contains(imageUrl))
            {
                productsDict[id].ImageUrl.Add(imageUrl);
            }
        }

        return Ok(productsDict.Values.ToList());
    }
}