import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  searchTerm: string = '';
  notification: { show: boolean; message: string; type: 'error' } = { show: false, message: '', type: 'error' };
  private notificationTimeout: any;

  constructor(private router: Router) { }

  showNotification(message: string): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notification = { show: true, message, type: 'error' };

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

  goToAuth(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  goToMain(): void {
    this.router.navigate(['/']);
  }

  goToCart(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.router.navigate(['/profile'], { fragment: 'cart' });
    } else {
      this.showNotification('НЕОБХОДИМО ВОЙТИ В АККАУНТ');
    }
  }

  search(): void {
    if (this.searchTerm.trim().length >= 2) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchTerm.trim() } });
    } else if (this.searchTerm.trim().length > 0) {
      this.showNotification('МИНИМУМ 2 СИМВОЛА ДЛЯ ПОИСКА');
    }
  }
}