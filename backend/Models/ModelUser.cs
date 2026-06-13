namespace backend.Models
{
    public class ModelUser
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty; 
        public string PasswordHash { get; set; } = string.Empty;  
        public string Username { get; set; } = string.Empty; 
        public string? PhoneNumber { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? AvatarUrl { get; set; }  
    }
}