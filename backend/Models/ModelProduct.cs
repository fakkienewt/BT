namespace backend.Models;

public class ModelProduct
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public List<string> ImageUrl { get; set; } = new();
    public string Brand { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}