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

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
  }

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      console.error('Пароли не совпадают');
      return;
    }

    const { confirmPassword, ...dataToSend } = this.registerData;

    this.authService.register(dataToSend).subscribe({
      next: (res) => {
        console.log('Успех', res);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('user', JSON.stringify({
          username: this.registerData.username,
          email: this.registerData.email
        }));
        this.router.navigate(['/']);
      },
      error: (err) => console.error('Ошибка', err)
    });
  }

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('Вход выполнен', res);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('user', JSON.stringify({
          username: res.username,
          email: res.email
        }));
        this.router.navigate(['/profile']); 
      },
      error: (err) => console.error('Ошибка входа', err)
    });
  }
}