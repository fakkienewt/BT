import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ServiceMain } from '../../services/service-main';
import { ModelProduct } from '../../models/model-product';

@Component({
  selector: 'app-new',
  imports: [CommonModule],
  templateUrl: './new.html',
  styleUrl: './new.scss',
})
export class New implements OnInit {
  newProducts: ModelProduct[] = [];
  displayedProducts: ModelProduct[] = [];
  loading = true;
  startIndex = 0;
  itemsPerPage = 6;

  constructor(private service: ServiceMain) { }

  ngOnInit(): void {
    this.loadNewItems();
    this.updateItemsPerPage();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateItemsPerPage();
  }

  updateItemsPerPage(): void {
    const width = window.innerWidth;
    if (width <= 600) this.itemsPerPage = 2;
    else if (width <= 900) this.itemsPerPage = 3;
    else if (width <= 1200) this.itemsPerPage = 4;
    else if (width <= 1400) this.itemsPerPage = 5;
    else this.itemsPerPage = 6;

    this.startIndex = Math.min(this.startIndex, Math.max(0, this.newProducts.length - this.itemsPerPage));
    this.updateDisplayedProducts();
  }

  loadNewItems(): void {
    this.loading = true;
    this.service.getNewItems().subscribe({
      next: (data: ModelProduct[]) => {
        this.newProducts = data;
        this.startIndex = 0;
        this.updateDisplayedProducts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки новинок:', err);
        this.loading = false;
      }
    });
  }

  updateDisplayedProducts(): void {
    this.displayedProducts = this.newProducts.slice(this.startIndex, this.startIndex + this.itemsPerPage);
  }

  nextSlide(): void {
    if (!this.hasNext) return;
    this.startIndex++;
    this.updateDisplayedProducts();
  }

  prevSlide(): void {
    if (!this.hasPrev) return;
    this.startIndex--;
    this.updateDisplayedProducts();
  }

  get hasPrev(): boolean {
    return this.startIndex > 0;
  }

  get hasNext(): boolean {
    return this.startIndex + this.itemsPerPage < this.newProducts.length;
  }
}