import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModelUser } from '../models/model-user';
import { ServiceMain } from '../services/service-main';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { Footer } from '../basic/footer/footer';
import { Header } from '../basic/header/header';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  user: ModelUser = {
    id: 0,
    email: '',
    passwordHash: '',
    username: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    deliveryAddress: '',
    birthDate: ''
  };
  loading = true;
  activeTab: 'profile' | 'orders' | 'favorites' | 'cart' = 'profile';

  cartItems: any[] = [];
  favoritesItems: any[] = [];
  orders: any[] = [];

  constructor(
    private service: ServiceMain,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      this.loading = false;
      return;
    }

    this.loadUserData();
    this.loadCart();
    this.loadFavorites();
    this.loadOrders();
  }

  loadUserData(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/auth']);
      this.loading = false;
      return;
    }

    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки профиля:', err);
        if (err.status === 404) {
          localStorage.removeItem('userId');
          localStorage.removeItem('user');
          this.router.navigate(['/auth']);
        }
        this.loading = false;
      }
    });
  }

  loadCart(): void {
    const saved = localStorage.getItem('cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
  }

  loadFavorites(): void {
    const saved = localStorage.getItem('favorites');
    this.favoritesItems = saved ? JSON.parse(saved) : [];
  }

  loadOrders(): void {
    const saved = localStorage.getItem('orders');
    this.orders = saved ? JSON.parse(saved) : [];
  }

  getInitials(): string {
    if (this.user.username) {
      return this.user.username[0].toUpperCase();
    }
    return 'U';
  }

  getTabTitle(): string {
    const titles = {
      profile: 'НАСТРОЙКИ ПРОФИЛЯ',
      orders: 'ИСТОРИЯ ЗАКАЗОВ',
      favorites: 'ИЗБРАННЫЕ ТОВАРЫ',
      cart: 'КОРЗИНА'
    };
    return titles[this.activeTab];
  }

  updateProfile(): void {
    this.authService.updateProfile(this.user).subscribe({
      next: () => {
        alert('Профиль обновлён');
      },
      error: (err: any) => {
        console.error('Ошибка обновления:', err);
        alert('Ошибка обновления профиля');
      }
    });
  }

  deleteAccount(): void {
    if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!')) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.authService.deleteAccount(parseInt(userId)).subscribe({
          next: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            alert('Аккаунт удалён');
            this.router.navigate(['/register']);
          },
          error: (err: any) => {
            console.error('Ошибка удаления:', err);
            alert('Ошибка удаления аккаунта');
          }
        });
      }
    }
  }

  removeFromCart(id: number): void {
    this.cartItems = this.cartItems.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  removeFromFavorites(event: Event, id: number): void {
    event.stopPropagation();
    this.favoritesItems = this.favoritesItems.filter(i => i.id !== id);
    localStorage.setItem('favorites', JSON.stringify(this.favoritesItems));
  }

  incrementQuantity(id: number): void {
    const item = this.cartItems.find(i => i.id === id);
    if (item) {
      item.quantity = (item.quantity || 1) + 1;
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  }

  decrementQuantity(id: number): void {
    const item = this.cartItems.find(i => i.id === id);
    if (item && (item.quantity || 1) > 1) {
      item.quantity = (item.quantity || 1) - 1;
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  }

  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }

  goToProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}