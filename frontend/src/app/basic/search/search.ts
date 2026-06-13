import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../header/header';
import { ModelProduct } from '../../models/model-product';
import { Footer } from '../footer/footer';
import { CartService } from '../../services/cart.service';
import { ServiceMain } from '../../services/service-main';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class Search implements OnInit {
  products: ModelProduct[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  noResults: boolean = false;

  notification: { show: boolean; message: string; type: 'success' | 'error' } = { show: false, message: '', type: 'success' };
  private notificationTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceMain,
    public cartService: CartService,
    public favoriteService: FavoriteService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery.length >= 2) {
        this.loadSearchResults();
      } else {
        this.loading = false;
        this.products = [];
        this.noResults = true;
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

  loadSearchResults(): void {
    this.loading = true;
    
    this.service.searchProducts(this.searchQuery).subscribe({
      next: (products) => {
        this.products = products.slice(0, 18);
        this.noResults = this.products.length === 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка поиска:', err);
        this.showNotification('ОШИБКА ПОИСКА', 'error');
        this.loading = false;
        this.products = [];
        this.noResults = true;
      }
    });
  }

  goToProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  goToMain(): void {
    this.router.navigate(['/']);
  }
}