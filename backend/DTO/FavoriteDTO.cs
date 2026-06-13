namespace backend.DTO;

public class FavoriteDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string ProductBrand { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AddToFavoriteRequest
{
    public int ProductId { get; set; }
}