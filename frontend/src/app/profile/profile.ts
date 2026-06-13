import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModelUser } from '../models/model-user';
import { ServiceMain } from '../services/service-main';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { CartService, CartItem } from '../services/cart.service';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  user: ModelUser = {
    id: 0,
    email: '',
    passwordHash: '',
    username: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    deliveryAddress: '',
    birthDate: '',
    avatarUrl: ''
  };
  loading = true;
  activeTab: 'profile' | 'orders' | 'favorites' | 'cart' = 'profile';

  cartItems: CartItem[] = [];
  favoritesItems: FavoriteItem[] = [];
  orders: any[] = [];

  favoritesCurrentPage: number = 1;
  favoritesItemsPerPage: number = 5;

  cartCurrentPage: number = 1;
  cartItemsPerPage: number = 5;

  newPassword: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  showDeleteModal: boolean = false;
  showLogoutModal: boolean = false;
  deleteConfirmText: string = '';
  isDeleting: boolean = false;

  notification: { show: boolean; message: string; type: 'success' | 'error' | 'info' } = { show: false, message: '', type: 'info' };
  private notificationTimeout: any;

  constructor(
    private service: ServiceMain,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    public cartService: CartService,
    public favoriteService: FavoriteService,
    private route: ActivatedRoute,
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

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'cart') {
        this.activeTab = 'cart';
      }
    });
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
        if (data.avatarUrl && !data.avatarUrl.startsWith('http')) {
          data.avatarUrl = `http://localhost:5195${data.avatarUrl}`;
        }
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
    this.cartItems = this.cartService.getCartItems();
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.fixCartPageAfterDelete();
    });
  }

  loadFavorites(): void {
    this.favoritesItems = this.favoriteService.getFavoriteItems();
    this.favoriteService.getFavorites().subscribe(items => {
      this.favoritesItems = items;
      this.fixFavoritesPageAfterDelete();
    });
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

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File): void {
    const formData = new FormData();
    formData.append('avatar', file);

    const userId = localStorage.getItem('userId');

    this.http.post(`http://localhost:5195/api/auth/${userId}/avatar`, formData).subscribe({
      next: (response: any) => {
        this.user.avatarUrl = `http://localhost:5195${response.avatarUrl}`;
        this.showNotification('АВАТАР ОБНОВЛЕН', 'success');
      },
      error: (err) => {
        console.error('Ошибка загрузки аватара:', err);
        this.showNotification('ОШИБКА ЗАГРУЗКИ АВАТАРА', 'error');
      }
    });
  }

  updateProfile(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updateData: any = {
      email: this.user.email,
      username: this.user.username,
      phoneNumber: this.user.phoneNumber,
      deliveryAddress: this.user.deliveryAddress,
      avatarUrl: this.user.avatarUrl
    };

    if (this.newPassword && this.newPassword.trim().length > 0) {
      updateData.password = this.newPassword;
    }

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'ПРОФИЛЬ ОБНОВЛЕН';

        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userData.username = this.user.username;
          userData.avatarUrl = this.user.avatarUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'ОШИБКА ОБНОВЛЕНИЯ';
        console.error('Ошибка обновления:', err);

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notification = { show: true, message, type };

    this.notificationTimeout = setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }

  closeNotification(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification.show = false;
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    localStorage.clear();
    this.showLogoutModal = false;
    this.showNotification('ВЫХОД ВЫПОЛНЕН', 'success');

    setTimeout(() => {
      this.router.navigate(['/main']);
    }, 300);
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deleteConfirmText = '';
    this.errorMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteConfirmText = '';
    this.isDeleting = false;
  }

  deleteAccount(): void {
    if (this.deleteConfirmText !== 'УДАЛИТЬ') {
      this.showNotification('ПОДТВЕРДИТЕ УДАЛЕНИЕ', 'error');
      return;
    }

    this.isDeleting = true;
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.showNotification('ОШИБКА АВТОРИЗАЦИИ', 'error');
      this.isDeleting = false;
      return;
    }

    this.authService.deleteAccount(parseInt(userId)).subscribe({
      next: () => {
        localStorage.clear();
        this.closeDeleteModal();
        this.showNotification('АККАУНТ УДАЛЕН', 'success');

        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.isDeleting = false;
        this.showNotification('ОШИБКА УДАЛЕНИЯ', 'error');
      }
    });
  }

  get paginatedFavorites(): FavoriteItem[] {
    const start = (this.favoritesCurrentPage - 1) * this.favoritesItemsPerPage;
    return this.favoritesItems.slice(start, start + this.favoritesItemsPerPage);
  }

  get favoritesTotalPages(): number {
    return Math.ceil(this.favoritesItems.length / this.favoritesItemsPerPage);
  }

  favoritesNextPage(): void {
    if (this.favoritesCurrentPage < this.favoritesTotalPages) {
      this.favoritesCurrentPage++;
    }
  }

  favoritesPrevPage(): void {
    if (this.favoritesCurrentPage > 1) {
      this.favoritesCurrentPage--;
    }
  }

  fixFavoritesPageAfterDelete(): void {
    const totalPages = this.favoritesTotalPages;
    if (this.favoritesCurrentPage > totalPages && totalPages > 0) {
      this.favoritesCurrentPage = totalPages;
    }
    if (this.favoritesItems.length === 0) {
      this.favoritesCurrentPage = 1;
    }
  }

  get paginatedCart(): CartItem[] {
    const start = (this.cartCurrentPage - 1) * this.cartItemsPerPage;
    return this.cartItems.slice(start, start + this.cartItemsPerPage);
  }

  get cartTotalPages(): number {
    return Math.ceil(this.cartItems.length / this.cartItemsPerPage);
  }

  cartNextPage(): void {
    if (this.cartCurrentPage < this.cartTotalPages) {
      this.cartCurrentPage++;
    }
  }

  cartPrevPage(): void {
    if (this.cartCurrentPage > 1) {
      this.cartCurrentPage--;
    }
  }

  fixCartPageAfterDelete(): void {
    const totalPages = this.cartTotalPages;
    if (this.cartCurrentPage > totalPages && totalPages > 0) {
      this.cartCurrentPage = totalPages;
    }
    if (this.cartItems.length === 0) {
      this.cartCurrentPage = 1;
    }
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        console.log('Товар удален из корзины');
        setTimeout(() => {
          this.fixCartPageAfterDelete();
        }, 100);
      },
      error: (err) => {
        console.error('Ошибка удаления:', err);
      }
    });
  }

  removeFromFavorites(event: Event, productId: number): void {
    event.stopPropagation();
    this.favoriteService.removeFromFavorite(productId).subscribe({
      next: () => {
        console.log('Товар удален из избранного');
        setTimeout(() => {
          this.fixFavoritesPageAfterDelete();
        }, 100);
      }
    });
  }

  incrementQuantity(productId: number): void {
    const item = this.cartItems.find(i => i.productId === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1).subscribe({
        next: () => {
          console.log('Количество увеличено');
        },
        error: (err) => {
          console.error('Ошибка обновления:', err);
        }
      });
    }
  }

  decrementQuantity(productId: number): void {
    const item = this.cartItems.find(i => i.productId === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1).subscribe({
        next: () => {
          console.log('Количество уменьшено');
        },
        error: (err) => {
          console.error('Ошибка обновления:', err);
        }
      });
    } else if (item && item.quantity === 1) {
      this.removeFromCart(productId);
    }
  }

  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }

  goToProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }
}