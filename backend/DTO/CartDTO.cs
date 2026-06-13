namespace backend.DTO;

public class CartDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string ProductBrand { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public DateTime AddedDate { get; set; }
}

public class AddToCartRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}