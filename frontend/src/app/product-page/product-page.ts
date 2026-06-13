import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceMain } from '../services/service-main';
import { ModelProduct } from '../models/model-product';
import { forkJoin } from 'rxjs';
import { Header } from '../basic/header/header';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './product-page.html',
  styleUrls: ['./product-page.scss']
})
export class ProductPage implements OnInit {
  product: ModelProduct | null = null;
  relatedProducts: ModelProduct[] = [];
  selectedImageIndex: number = 0;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    public service: ServiceMain
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(productId: number): void {
    this.loading = true;

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
        this.product = allProducts.find(p => p.id === productId) || null;

        if (this.product) {
          const categoryProducts = allProducts.filter(p => p.category === this.product?.category);
          this.relatedProducts = categoryProducts
            .filter(p => p.id !== this.product?.id)
            .slice(0, 5);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    }); 
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