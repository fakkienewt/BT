import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceMain } from '../../services/service-main';
import { ModelProduct } from '../../models/model-product';
import { Observable } from 'rxjs';
import { New } from '../new/new';
import { Catalog } from '../catalog/catalog';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

type Category = 'phones' | 'laptops' | 'computers' | 'tablets' | 'tv';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, New, Catalog, Header, Footer],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {

  allProducts: ModelProduct[] = [];
  products: ModelProduct[] = [];
  currentCategory: Category = 'phones';
  showCatalog = false;
  loading = false;
  pageSize = 18;

  constructor(
    public service: ServiceMain,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      if (category && this.isValidCategory(category)) {
        this.currentCategory = category as Category;
        this.showCatalog = false;
        this.loadCategory(this.currentCategory);
      } else {
        this.loadCategory(this.currentCategory);
      }
    });
  }

  isValidCategory(category: string): boolean {
    return ['phones', 'laptops', 'computers', 'tablets', 'tv'].includes(category);
  }

  loadCategory(category: Category): void {
    this.loading = true;
    let request: Observable<ModelProduct[]>;

    switch (category) {
      case 'phones':
        request = this.service.getPhones();
        break;
      case 'laptops':
        request = this.service.getLaptops();
        break;
      case 'computers':
        request = this.service.getComputers();
        break;
      case 'tablets':
        request = this.service.getTablets();
        break;
      default:
        request = this.service.getPhones();
    }

    request.subscribe({
      next: (data: ModelProduct[]) => {
        this.allProducts = data;
        this.service.currentPage = 1;
        this.updateDisplayedProducts();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  updateDisplayedProducts(): void {
    const start = (this.service.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.products = this.allProducts.slice(start, end);
  }

  changeCategory(category: Category): void {
    this.currentCategory = category;
    this.showCatalog = false;
    this.service.currentPage = 1;
    this.loadCategory(category);
  }

  goToCatalog(): void {
    this.showCatalog = true;
  }

  nextPage(): void {
    if (this.service.currentPage * this.pageSize >= this.allProducts.length) return;
    this.service.nextPage();
    this.updateDisplayedProducts();
  }

  prevPage(): void {
    if (this.service.currentPage <= 1) return;
    this.service.backPage();
    this.updateDisplayedProducts();
  }
}