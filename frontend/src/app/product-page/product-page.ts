import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceMain } from '../services/service-main';
import { ModelProduct } from '../models/model-product';
import { forkJoin } from 'rxjs';
import { Header } from '../basic/header/header';
import { Footer } from '../basic/footer/footer';
import { CartService } from '../services/cart.service';
import { FavoriteService } from '../services/favorite.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './product-page.html',
  styleUrls: ['./product-page.scss']
})
export class ProductPage implements OnInit {
  product: ModelProduct | null = null;
  relatedProducts: ModelProduct[] = [];
  selectedImageIndex: number = 0;
  loading: boolean = true;
  isInCart: boolean = false;
  isInFavorite: boolean = false;
  error: string = '';

  notification: { show: boolean; message: string; type: 'success' | 'error' } = { show: false, message: '', type: 'success' };
  private notificationTimeout: any;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public service: ServiceMain,
    public cartService: CartService,
    public favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit вызван');

    this.product = null;
    this.relatedProducts = [];
    this.selectedImageIndex = 0;
    this.isInCart = false;
    this.isInFavorite = false;
    this.loading = true;
    this.error = '';

    window.scrollTo(0, 0);

    this.route.params.subscribe(params => {
      const productId = +params['id'];
      console.log('Получен ID из URL:', productId);

      if (productId && !isNaN(productId)) {
        this.loadProduct(productId);
      } else {
        console.error('Неверный ID товара');
        this.error = 'Неверный ID товара';
        this.loading = false;
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

  checkAuthAndProceed(action: () => void): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showNotification('НЕОБХОДИМО ВОЙТИ В АККАУНТ', 'error');
      return;
    }
    action();
  }

  loadProduct(productId: number): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    window.scrollTo({ top: 0, behavior: 'instant' });

    this.http.get<ModelProduct>(`http://localhost:5195/api/product/${productId}`).subscribe({
      next: (product) => {
        console.log('Найденный товар:', product);
        this.product = product;

        if (this.product) {
          this.loadRelatedProducts(this.product.id);
          this.checkIfInCart();
          this.checkIfInFavorite();
        }

        this.loading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 100);
      },
      error: (err) => {
        console.error('Ошибка загрузки товара:', err);
        this.error = 'Товар не найден';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRelatedProducts(currentProductId: number): void {
    this.service.resetPage();

    const requests = [
      this.service.getPhones(),
      this.service.getLaptops(),
      this.service.getComputers(),
      this.service.getTablets(),
      this.service.getTVs(),
      this.service.getMonitory(),
      this.service.getPristavki(),
      this.service.getSmartWatches(),
      this.service.getFitnessBands(),
      this.service.getGamingKeyboards(),
      this.service.getGamingConsoles(),
      this.service.getGamingMice(),
      this.service.getMicrophones(),
      this.service.getSpeakers(),
      this.service.getHeadphones(),
      this.service.getCablesAndChargers(),
      this.service.getBatteries(),
      this.service.getWirelessChargers()
    ];

    forkJoin(requests).subscribe({
      next: (results) => {
        const allProducts = results.flat();
        console.log('Всего товаров из всех категорий:', allProducts.length);

        const otherProducts = allProducts.filter(p => p.id !== currentProductId);
        console.log('Товаров без текущего:', otherProducts.length);

        console.log('Пример первых трех товаров:', otherProducts.slice(0, 3));

        for (let i = otherProducts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherProducts[i], otherProducts[j]] = [otherProducts[j], otherProducts[i]];
        }

        this.relatedProducts = otherProducts.slice(0, 5);
        console.log('Финальный массив relatedProducts:', this.relatedProducts.length);
        console.log('Содержимое relatedProducts:', this.relatedProducts);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки связанных товаров:', err);
      }
    });
  }

  checkIfInCart(): void {
    if (this.product) {
      this.isInCart = this.cartService.isInCart(this.product.id);
    }
  }

  checkIfInFavorite(): void {
    if (this.product) {
      this.isInFavorite = this.favoriteService.isInFavorite(this.product.id);
    }
  }

  addToCart(): void {
    this.checkAuthAndProceed(() => {
      if (this.product) {
        this.cartService.addToCart(this.product).subscribe({
          next: () => {
            this.isInCart = true;
            this.showNotification('ТОВАР ДОБАВЛЕН В КОРЗИНУ', 'success');
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Ошибка при добавлении:', err);
            this.showNotification('ОШИБКА ДОБАВЛЕНИЯ', 'error');
          }
        });
      }
    });
  }

  addToCartRelated(product: ModelProduct): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showNotification('НЕОБХОДИМО ВОЙТИ В АККАУНТ', 'error');
      return;
    }

    this.cartService.addToCart(product).subscribe({
      next: () => {
        this.showNotification('ТОВАР ДОБАВЛЕН В КОРЗИНУ', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка при добавлении:', err);
        this.showNotification('ОШИБКА ДОБАВЛЕНИЯ', 'error');
      }
    });
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.isInCart = false;
        this.showNotification('ТОВАР УДАЛЕН ИЗ КОРЗИНЫ', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка при удалении:', err);
      }
    });
  }

  toggleFavorite(): void {
    this.checkAuthAndProceed(() => {
      if (!this.product) return;

      if (this.isInFavorite) {
        this.favoriteService.removeFromFavorite(this.product.id).subscribe({
          next: () => {
            this.isInFavorite = false;
            this.showNotification('ТОВАР УДАЛЕН ИЗ ИЗБРАННОГО', 'success');
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Ошибка при удалении из избранного:', err);
          }
        });
      } else {
        this.favoriteService.addToFavorite(this.product.id).subscribe({
          next: () => {
            this.isInFavorite = true;
            this.showNotification('ТОВАР ДОБАВЛЕН В ИЗБРАННОЕ', 'success');
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Ошибка при добавлении в избранное:', err);
          }
        });
      }
    });
  }

  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }

  goToProduct(productId: number): void {
    window.location.href = `/product/${productId}`;
  }

  goToMain(): void {
    window.location.href = '/';
  }

  getCategoryName(category: string): string {
    const categories: Record<string, string> = {
      'phones': 'Смартфоны',
      'laptops': 'Ноутбуки',
      'computers': 'Компьютеры',
      'tablets': 'Планшеты',
      'tv': 'Телевизоры',
      'monitory': 'Мониторы',
      'pristavki': 'Приставки',
      'smart-watches': 'Умные часы',
      'fitness-bands': 'Фитнес-браслеты',
      'gaming-keyboards': 'Игровые клавиатуры',
      'gaming-consoles': 'Игровые консоли',
      'gaming-mice': 'Игровые мыши',
      'microphones': 'Микрофоны',
      'speakers': 'Колонки',
      'headphones': 'Наушники',
      'cables-chargers': 'Кабели и зарядки',
      'batteries': 'Батареи',
      'wireless-chargers': 'Беспроводные зарядки'
    };
    return categories[category] || category;
  }
}
