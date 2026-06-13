export interface ModelUser {
    id: number;
    email: string;
    passwordHash: string;
    username: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    deliveryAddress?: string;
    birthDate?: string;
    avatarUrl?: string;  
}