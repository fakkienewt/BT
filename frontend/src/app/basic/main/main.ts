import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceMain } from '../../services/service-main';
import { ModelProduct } from '../../models/model-product';
import { Observable } from 'rxjs';
import { New } from '../new/new';
import { Catalog } from '../catalog/catalog';

type Category = 'phones' | 'laptops' | 'computers' | 'tablets' | 'tv';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, New, Catalog],
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

  constructor(public service: ServiceMain) { }

  ngOnInit(): void {
    this.loadCategory(this.currentCategory);
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