import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelProduct } from '../../models/model-product';
import { ServiceMain } from '../../services/service-main';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {

  activeCategory: string = 'phones';
  activeSubcategory: string = '';
  allProducts: ModelProduct[] = [];
  products: ModelProduct[] = [];
  loading: boolean = true;
  noData: boolean = false;
  pageSize: number = 18;

  constructor(public service: ServiceMain, private router: Router) { }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  ngOnInit(): void {
    this.selectCategory('phones');
  }

  mainCategories = [
    { id: 'phones', name: 'ТЕЛЕФОНЫ' },
    { id: 'tv-tablets', name: 'ТВ, ПЛАНШЕТЫ, НОУТБУКИ' },
    { id: 'smartwatch', name: 'УМНЫЕ ЧАСЫ И БРАСЛЕТЫ' },
    { id: 'gaming', name: 'ИГРОВАЯ ЗОНА' },
    { id: 'audio', name: 'АУДИО' },
    { id: 'charging', name: 'ЗАРЯДНЫЕ УСТРОЙСТВА' }
  ];

  subCategories: any = {
    'phones': [
      { id: 'xiaomi', name: 'Xiaomi', apiMethod: 'phones', brand: 'Xiaomi' },
      { id: 'poco', name: 'POCO', apiMethod: 'phones', brand: 'POCO' },
      { id: 'apple', name: 'Apple', apiMethod: 'phones', brand: 'Apple' },
      { id: 'honor', name: 'HONOR', apiMethod: 'phones', brand: 'HONOR' },
      { id: 'infinix', name: 'Infinix', apiMethod: 'phones', brand: 'Infinix' },
      { id: 'realme', name: 'Realme', apiMethod: 'phones', brand: 'Realme' },
      { id: 'tecno', name: 'Tecno', apiMethod: 'phones', brand: 'Tecno' },
      { id: 'vivo', name: 'Vivo', apiMethod: 'phones', brand: 'Vivo' }
    ],
    'tv-tablets': [
      { id: 'tv', name: 'Телевизоры', apiMethod: 'tv', brand: '' },
      { id: 'tablets', name: 'Планшеты', apiMethod: 'tablets', brand: '' },
      { id: 'laptops', name: 'Ноутбуки', apiMethod: 'laptops', brand: '' },
      { id: 'computers', name: 'Компьютеры', apiMethod: 'computers', brand: '' },
      { id: 'pristavki', name: 'ТВ приставки', apiMethod: 'pristavki', brand: '' }
    ],
    'smartwatch': [
      { id: 'smart-watches', name: 'Смарт-часы', apiMethod: 'smart-watches', brand: '' },
      { id: 'fitness-bands', name: 'Фитнес-браслеты', apiMethod: 'fitness-bands', brand: '' }
    ],
    'gaming': [
      { id: 'keyboards', name: 'Игровые клавиатуры', apiMethod: 'keyboards', brand: '' },
      { id: 'game-consoles', name: 'Игровые приставки', apiMethod: 'game-consoles', brand: '' },
      { id: 'mice', name: 'Компьютерные мыши', apiMethod: 'mice', brand: '' },
      { id: 'gaming-monitors', name: 'Игровые мониторы', apiMethod: 'gaming-monitors', brand: '' }
    ],
    'audio': [
      { id: 'speakers', name: 'Колонки', apiMethod: 'speakers', brand: '' },
      { id: 'headphones', name: 'Наушники', apiMethod: 'headphones', brand: '' },
      { id: 'microphones', name: 'Микрофоны', apiMethod: 'microphones', brand: '' }
    ],
    'charging': [
      { id: 'cables', name: 'Кабели и зарядки', apiMethod: 'cables', brand: '' },
      { id: 'wireless', name: 'Беспроводные зарядные', apiMethod: 'wireless', brand: '' },
      { id: 'batteries', name: 'Батарейки и аккумуляторы', apiMethod: 'batteries', brand: '' },
      { id: 'powerbanks', name: 'Повербанк', apiMethod: 'powerbanks', brand: '' },
    ]
  };

  selectCategory(categoryId: string): void {
    this.activeCategory = categoryId;
    this.service.resetPage();
    const subs = this.getSubcategories();
    if (categoryId === 'phones') {
      const xiaomiSub = subs.find(s => s.id === 'xiaomi');
      this.activeSubcategory = xiaomiSub ? xiaomiSub.id : (subs.length > 0 ? subs[0].id : '');
    } else {
      this.activeSubcategory = subs.length > 0 ? subs[0].id : '';
    }
    this.fetchData();
  }

  selectSubcategory(subcategoryId: string): void {
    this.activeSubcategory = subcategoryId;
    this.service.resetPage();
    this.fetchData();
  }

  getSubcategories(): any[] {
    return this.subCategories[this.activeCategory] || [];
  }

  getCurrentSubcategory(): any {
    const subs = this.getSubcategories();
    return subs.find(s => s.id === this.activeSubcategory) || subs[0];
  }

  fetchData(): void {
    this.loading = true;
    this.noData = false;
    this.allProducts = [];
    this.products = [];

    const sub = this.getCurrentSubcategory();
    if (!sub) {
      this.loading = false;
      this.noData = true;
      return;
    }

    const request = this.getRequestBySubcategory(sub);

    if (!request) {
      this.loading = false;
      this.noData = true;
      return;
    }

    request.subscribe({
      next: (data: ModelProduct[]) => {
        if (sub.brand) {
          this.allProducts = data.filter(p => p.brand?.toLowerCase() === sub.brand.toLowerCase());
        } else {
          this.allProducts = data;
        }
        this.service.currentPage = 1;
        this.updateDisplayedProducts();
        this.loading = false;
        this.noData = this.allProducts.length === 0;
      },
      error: (err: any) => {
        console.error('Ошибка загрузки:', err);
        this.loading = false;
        this.noData = true;
      }
    });
  }

  updateDisplayedProducts(): void {
    const start = (this.service.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.products = this.allProducts.slice(start, end);
  }

  getRequestBySubcategory(sub: any): any {
    const methodMap: { [key: string]: () => any } = {
      'phones': () => this.service.getPhones(),
      'laptops': () => this.service.getLaptops(),
      'computers': () => this.service.getComputers(),
      'tablets': () => this.service.getTablets(),
      'tv': () => this.service.getTVs(),
      'monitory': () => this.service.getMonitory(),
      'pristavki': () => this.service.getPristavki(),
      'smart-watches': () => this.service.getSmartWatches(),
      'fitness-bands': () => this.service.getFitnessBands(),
      'keyboards': () => this.service.getGamingKeyboards(),
      'game-consoles': () => this.service.getGamingConsoles(),
      'mice': () => this.service.getGamingMice(),
      'gaming-monitors': () => this.service.getMonitory(),
      'microphones': () => this.service.getMicrophones(),
      'speakers': () => this.service.getSpeakers(),
      'headphones': () => this.service.getHeadphones(),
      'cables': () => this.service.getCablesAndChargers(),
      'batteries': () => this.service.getBatteries(),
      'wireless': () => this.service.getWirelessChargers(),
    };

    return methodMap[sub.apiMethod] ? methodMap[sub.apiMethod]() : null;
  }

  prevPage(): void {
    if (this.service.currentPage <= 1) return;
    this.service.backPage();
    this.updateDisplayedProducts();
  }

  nextPage(): void {
    if (this.service.currentPage * this.pageSize >= this.allProducts.length) return;
    this.service.nextPage();
    this.updateDisplayedProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.allProducts.length / this.pageSize);
  }
}