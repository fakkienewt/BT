import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.html',
  styleUrls: ['./registration.scss']
})
export class Registration implements OnInit {
  activeTab: 'login' | 'register' = 'login';

  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  loginData = {
    email: '',
    password: ''
  };

  notification: { show: boolean; message: string; type: 'success' | 'error' } = { show: false, message: '', type: 'success' };
  private notificationTimeout: any;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.router.navigate(['/profile']);
    }
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

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.notification.show = false;
  }

  onRegister() {
    if (!this.registerData.username.trim()) {
      this.showNotification('ВВЕДИТЕ ИМЯ ПОЛЬЗОВАТЕЛЯ', 'error');
      return;
    }

    if (!this.registerData.email.trim()) {
      this.showNotification('ВВЕДИТЕ EMAIL', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.showNotification('НЕКОРРЕКТНЫЙ EMAIL', 'error');
      return;
    }

    if (!this.registerData.password) {
      this.showNotification('ВВЕДИТЕ ПАРОЛЬ', 'error');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.showNotification('ПАРОЛЬ ДОЛЖЕН БЫТЬ НЕ МЕНЕЕ 6 СИМВОЛОВ', 'error');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.showNotification('ПАРОЛИ НЕ СОВПАДАЮТ', 'error');
      return;
    }

    const { confirmPassword, ...dataToSend } = this.registerData;

    this.authService.register(dataToSend).subscribe({
      next: (res) => {
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('user', JSON.stringify({
          username: this.registerData.username,
          email: this.registerData.email
        }));
        this.router.navigate(['/']);
      },
      error: (err) => {
        let errorMessage = 'ОШИБКА РЕГИСТРАЦИИ';
        if (err.error?.message === 'Email already exists') {
          errorMessage = 'EMAIL УЖЕ ЗАРЕГИСТРИРОВАН';
        } else if (err.error?.message) {
          errorMessage = err.error.message.toUpperCase();
        }
        this.showNotification(errorMessage, 'error');
      }
    });
  }

  onLogin() {
    if (!this.loginData.email.trim()) {
      this.showNotification('ВВЕДИТЕ EMAIL', 'error');
      return;
    }

    if (!this.loginData.password) {
      this.showNotification('ВВЕДИТЕ ПАРОЛЬ', 'error');
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('user', JSON.stringify({
          username: res.username,
          email: res.email
        }));
        this.router.navigate(['/']);
      },
      error: (err) => {
        let errorMessage = 'ОШИБКА ВХОДА';
        if (err.status === 401) {
          errorMessage = 'НЕВЕРНЫЙ EMAIL ИЛИ ПАРОЛЬ';
        } else if (err.error?.message) {
          errorMessage = err.error.message.toUpperCase();
        }
        this.showNotification(errorMessage, 'error');
      }
    });
  }
}