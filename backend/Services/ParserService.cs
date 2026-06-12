using HtmlAgilityPack;
using MySql.Data.MySqlClient;
using backend.Database;
using backend.Models;

namespace backend.Services;

public class ParserService
{
    private readonly HttpClient _httpClient;
    private readonly DbHelper _dbHelper;
    private readonly string _baseUrlPhones = "https://xistore.by/catalog/telefony/";
    private readonly string _baseUrlLaptops = "https://xistore.by/catalog/noutbuki_/";
    private readonly string _baseUrlComputers = "https://xistore.by/catalog/computers/";
    private readonly string _baseUrlTablets = "https://xistore.by/catalog/planshety_/";
    private readonly string _baseUrlSmartTelevizory = "https://xistore.by/catalog/smart_televizory/";
    private readonly string _baseUrlMonitory = "https://xistore.by/catalog/monitory/";
    private readonly string _baseUrlPristavki = "https://xistore.by/catalog/pristavki/";
    private readonly string _baseUrlSmartWatches = "https://xistore.by/catalog/smart_chasy/";
    private readonly string _baseUrlFitnessBracelets = "https://xistore.by/catalog/fitnes_braslety/";
    private readonly string _baseUrlGamingKeyboards = "https://xistore.by/catalog/gaming_keyboards/";
    private readonly string _baseUrlGamingConsoles = "https://xistore.by/catalog/gaming_consoles/";
    private readonly string _baseUrlGamingMouse = "https://xistore.by/catalog/gaming_mouse/";
    private readonly string _baseUrlMicrophones = "https://xistore.by/catalog/mikrofony/";
    private readonly string _baseUrlSpeakers = "https://xistore.by/catalog/kolonki/";
    private readonly string _baseUrlHeadphones = "https://xistore.by/catalog/nakladnyye_naushniki/";
    private readonly string _baseUrlCables = "https://xistore.by/catalog/kabelya_i_zaryadki/";
    private readonly string _baseUrlBatteries = "https://xistore.by/catalog/batareyki/";
    private readonly string _baseUrlWirelessChargers = "https://xistore.by/catalog/besprovodnyye_zaryadnyye/";

    private int _parsedCount = 0;

    public ParserService(DbHelper dbHelper)
    {
        _dbHelper = dbHelper;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        _httpClient.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
        _httpClient.DefaultRequestHeaders.Add("Accept-Language", "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3");
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task ParseAllPhones(int maxPhones = 120)
    {
        await ClearDatabase();
        _parsedCount = 0;
        await ParseCategory(_baseUrlPhones, "phones", maxPhones);
    }

    public async Task ParseAllLaptops(int maxLaptops = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlLaptops, "laptops", maxLaptops);
    }

    public async Task ParseAllComputers(int maxComputers = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlComputers, "computers", maxComputers);
    }

    public async Task ParseAllTablets(int maxTablets = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlTablets, "tablets", maxTablets);
    }

    public async Task ParseAllSmartTelevizory(int maxTelevizory = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlSmartTelevizory, "smart_televizory", maxTelevizory);
    }

    public async Task ParseAllMonitory(int maxMonitory = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlMonitory, "monitory", maxMonitory);
    }

    public async Task ParseAllPristavki(int maxPristavki = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlPristavki, "pristavki", maxPristavki);
    }

    public async Task ParseAllSmartWatches(int maxWatches = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlSmartWatches, "smart_watches", maxWatches);
    }

    public async Task ParseAllFitnessBracelets(int maxBracelets = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlFitnessBracelets, "fitness_bracelets", maxBracelets);
    }

    public async Task ParseAllGamingKeyboards(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlGamingKeyboards, "gaming_keyboards", maxItems);
    }

    public async Task ParseAllGamingConsoles(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlGamingConsoles, "gaming_consoles", maxItems);
    }

    public async Task ParseAllGamingMice(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlGamingMouse, "gaming_mice", maxItems);
    }

    public async Task ParseAllMicrophones(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlMicrophones, "microphones", maxItems);
    }

    public async Task ParseAllSpeakers(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlSpeakers, "speakers", maxItems);
    }

    public async Task ParseAllHeadphones(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlHeadphones, "headphones", maxItems);
    }

    public async Task ParseAllCablesAndChargers(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlCables, "cables_chargers", maxItems);
    }

    public async Task ParseAllBatteries(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlBatteries, "batteries", maxItems);
    }

    public async Task ParseAllWirelessChargers(int maxItems = 120)
    {
        _parsedCount = 0;
        await ParseCategory(_baseUrlWirelessChargers, "wireless_chargers", maxItems);
    }

    private async Task ClearDatabase()
    {
        using var conn = _dbHelper.GetConnection();
        await conn.OpenAsync();

        using var cmd1 = new MySqlCommand("DELETE FROM ProductImages", conn);
        await cmd1.ExecuteNonQueryAsync();

        using var cmd2 = new MySqlCommand("DELETE FROM Products", conn);
        await cmd2.ExecuteNonQueryAsync();

        Console.WriteLine("🗑️ База данных очищена");
    }

    private async Task ParseCategory(string baseUrl, string category, int maxItems)
    {
        var processedUrls = new HashSet<string>();
        int emptyPageCount = 0;
        int maxPages = 50;

        for (int page = 1; page <= maxPages && _parsedCount < maxItems; page++)
        {
            string url = $"{baseUrl}?PAGEN_1={page}";
            Console.WriteLine($"📄 Страница {page}: {url}");

            try
            {
                string html = await _httpClient.GetStringAsync(url);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var productCards = doc.DocumentNode.SelectNodes("//div[contains(@class, 'search__page_item')]");

                if (productCards == null || productCards.Count == 0)
                {
                    emptyPageCount++;
                    if (emptyPageCount >= 3)
                    {
                        Console.WriteLine($"📭 3 пустые страницы подряд, завершаем");
                        break;
                    }
                    continue;
                }

                emptyPageCount = 0;
                Console.WriteLine($"📦 Найдено товаров на странице: {productCards.Count}");

                foreach (var card in productCards)
                {
                    if (_parsedCount >= maxItems) break;

                    string productUrl = ExtractProductUrl(card);
                    if (string.IsNullOrEmpty(productUrl) || processedUrls.Contains(productUrl)) continue;

                    processedUrls.Add(productUrl);
                    await ParseProductPage(productUrl, category);
                    await Task.Delay(500);
                }
            }
            catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                Console.WriteLine($"⚠️ Слишком много запросов, пауза 60 секунд...");
                await Task.Delay(60000);
                page--;
                continue;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка загрузки страницы {page}: {ex.Message}");
                await Task.Delay(2000);
            }

            await Task.Delay(1000);
        }

        Console.WriteLine($"✅ Спаршено {_parsedCount} {category}");
    }

    private async Task ParseProductPage(string url, string category)
    {
        try
        {
            string html = await _httpClient.GetStringAsync(url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var product = new ModelProduct();
            product.ImageUrl = new List<string>();

            var titleNode = doc.DocumentNode.SelectSingleNode("//h1");
            product.Title = titleNode?.InnerText.Trim() ?? "";
            if (string.IsNullOrEmpty(product.Title)) return;

            product.Price = ExtractPrice(doc);
            if (product.Price == 0) return;

            product.Brand = ExtractBrand(doc);
            product.Category = category;
            product.ImageUrl = ExtractImages(doc);

            if (product.ImageUrl.Count == 0) return;

            await SaveToDatabase(product);
            _parsedCount++;
            Console.WriteLine($"[{_parsedCount}] {product.Title} — {product.Price} BYN (Бренд: {product.Brand ?? "не указан"})");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"🔴 Ошибка {url}: {ex.Message}");
        }
    }

    private decimal ExtractPrice(HtmlDocument doc)
    {
        var priceSelectors = new[] {
            "//div[contains(@class, 'sale-price')]//span[contains(@class, 'price')]",
            "//div[contains(@class, 'full-price')]//span[contains(@class, 'price')]",
            "//div[contains(@class, 'price')]//span[contains(@class, 'price')]",
            "//div[contains(@class, 'sale-price')]",
            "//meta[@itemprop='price']/@content",
            "//span[@itemprop='price']/@content"
        };

        foreach (var selector in priceSelectors)
        {
            var node = doc.DocumentNode.SelectSingleNode(selector);
            if (node != null)
            {
                string priceStr = node.InnerText;
                if (selector.Contains("meta") || selector.Contains("@content"))
                    priceStr = node.GetAttributeValue("content", "");

                priceStr = System.Text.RegularExpressions.Regex.Replace(priceStr, @"[^0-9,\.]", "");
                if (decimal.TryParse(priceStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal price))
                    return price;
            }
        }
        return 0;
    }

    private string ExtractBrand(HtmlDocument doc)
    {
        var metaBrand = doc.DocumentNode.SelectSingleNode("//meta[@itemprop='brand']/@content");
        if (metaBrand != null)
        {
            string brand = metaBrand.GetAttributeValue("content", "").Trim();
            if (!string.IsNullOrEmpty(brand))
                return brand;
        }

        var schemaBrand = doc.DocumentNode.SelectSingleNode("//div[@itemscope and @itemprop='brand']//meta[@itemprop='name']/@content");
        if (schemaBrand != null)
        {
            string brand = schemaBrand.GetAttributeValue("content", "").Trim();
            if (!string.IsNullOrEmpty(brand))
                return brand;
        }

        var breadcrumbs = doc.DocumentNode.SelectNodes("//ul[@id='breadcrumbs']//li/a");
        if (breadcrumbs != null && breadcrumbs.Count >= 2)
        {
            string brand = breadcrumbs[breadcrumbs.Count - 2].InnerText.Trim();
            if (!string.IsNullOrEmpty(brand) && brand.Length < 30 && !brand.Contains("Каталог") && !brand.Contains("каталог"))
                return brand;
        }

        var metaNameBrand = doc.DocumentNode.SelectSingleNode("//meta[@name='brand']/@content");
        if (metaNameBrand != null)
        {
            string brand = metaNameBrand.GetAttributeValue("content", "").Trim();
            if (!string.IsNullOrEmpty(brand))
                return brand;
        }

        var h1 = doc.DocumentNode.SelectSingleNode("//h1");
        if (h1 != null)
        {
            string[] words = h1.InnerText.Trim().Split(' ');
            foreach (var word in words)
            {
                if (word.Length >= 3 && word.Length < 20 && char.IsUpper(word[0]))
                    return word;
            }
        }

        return null;
    }

    private List<string> ExtractImages(HtmlDocument doc)
    {
        var images = new List<string>();

        var imgSelectors = new[] {
            "//div[contains(@class, 'slider--item')]//img/@src",
            "//div[contains(@class, 'product-general-gallery')]//img/@src",
            "//div[contains(@class, 'gallery')]//img/@src",
            "//meta[@property='og:image']/@content",
            "//img[@itemprop='image']/@src"
        };

        foreach (var selector in imgSelectors)
        {
            var nodes = doc.DocumentNode.SelectNodes(selector);
            if (nodes != null && nodes.Count > 0)
            {
                foreach (var node in nodes)
                {
                    string src = node.GetAttributeValue("src", "");
                    if (string.IsNullOrEmpty(src)) src = node.GetAttributeValue("content", "");

                    if (!string.IsNullOrEmpty(src))
                    {
                        if (src.StartsWith("/"))
                            src = "https://xistore.by" + src;
                        if (!images.Contains(src))
                            images.Add(src);
                    }
                }
                if (images.Count > 0) break;
            }
        }

        return images;
    }

    private string ExtractProductUrl(HtmlNode card)
    {
        var linkSelectors = new[] {
            ".//div[contains(@class, 'product-name')]/a",
            ".//div[contains(@class, 'search__page-slider')]//a[contains(@class, 'search__page_item-img')]",
            ".//a[contains(@class, 'search__page_item-img')]",
            ".//a[contains(@href, '/product/')]",
            ".//a[contains(@href, '/catalog/')][1]"
        };

        foreach (var selector in linkSelectors)
        {
            var link = card.SelectSingleNode(selector);
            if (link != null)
            {
                string url = link.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(url) && !url.Contains("javascript"))
                {
                    if (url.StartsWith("/"))
                        url = "https://xistore.by" + url;
                    if (url.Contains("/catalog/") && !url.Contains("?PAGEN"))
                        return url;
                }
            }
        }
        return null;
    }

    private async Task SaveToDatabase(ModelProduct product)
    {
        using var conn = _dbHelper.GetConnection();
        await conn.OpenAsync();

        string checkSql = "SELECT COUNT(*) FROM Products WHERE Title = @title";
        using var checkCmd = new MySqlCommand(checkSql, conn);
        checkCmd.Parameters.AddWithValue("@title", product.Title);
        int exists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());

        if (exists > 0)
        {
            Console.WriteLine($"⚠️ Дубль пропущен: {product.Title}");
            return;
        }

        using var transaction = await conn.BeginTransactionAsync();

        try
        {
            string sqlProduct = @"
                INSERT INTO Products (Title, Price, Brand, Category) 
                VALUES (@title, @price, @brand, @category);
                SELECT LAST_INSERT_ID();";

            using var cmd = new MySqlCommand(sqlProduct, conn, transaction);
            cmd.Parameters.AddWithValue("@title", product.Title);
            cmd.Parameters.AddWithValue("@price", product.Price);
            cmd.Parameters.AddWithValue("@brand", string.IsNullOrEmpty(product.Brand) ? DBNull.Value : (object)product.Brand);
            cmd.Parameters.AddWithValue("@category", product.Category);

            int productId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

            string sqlImage = "INSERT INTO ProductImages (ProductId, ImageUrl, OrderIndex) VALUES (@pid, @url, @idx)";
            for (int i = 0; i < product.ImageUrl.Count; i++)
            {
                using var imgCmd = new MySqlCommand(sqlImage, conn, transaction);
                imgCmd.Parameters.AddWithValue("@pid", productId);
                imgCmd.Parameters.AddWithValue("@url", product.ImageUrl[i]);
                imgCmd.Parameters.AddWithValue("@idx", i);
                await imgCmd.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"❌ Ошибка БД: {ex.Message}");
        }
    }
}