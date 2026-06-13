import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ModelProduct } from '../models/model-product';

export interface CartItem {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    productTitle: string;
    productPrice: number;
    productImage: string;
    productBrand: string;
    addedDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'http://localhost:5195/api/cart';
    private cartItems: CartItem[] = [];
    private cartSubject = new BehaviorSubject<CartItem[]>([]);

    constructor(private http: HttpClient) {
        this.loadCart();
    }

    private getUserId(): number {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            return 0;
        }
        return parseInt(userId);
    }

    loadCart(): void {
        const userId = this.getUserId();
        if (userId === 0) {
            this.cartItems = [];
            this.cartSubject.next([]);
            return;
        }

        this.http.get<CartItem[]>(`${this.apiUrl}/${userId}`).subscribe({
            next: (items) => {
                this.cartItems = items;
                this.cartSubject.next(this.cartItems);
            },
            error: (err) => {
                console.error('Error loading cart:', err);
                this.cartItems = [];
                this.cartSubject.next([]);
            }
        });
    }

    getCart(): Observable<CartItem[]> {
        return this.cartSubject.asObservable();
    }

    getCartItems(): CartItem[] {
        return this.cartItems;
    }

    addToCart(product: ModelProduct): Observable<any> {
        const userId = this.getUserId();
        if (userId === 0) {
            alert('Пожалуйста, войдите в аккаунт');
            return new Observable();
        }

        return this.http.post(`${this.apiUrl}/${userId}/add`, {
            productId: product.id,
            quantity: 1
        }).pipe(
            tap(() => this.loadCart())
        );
    }

    removeFromCart(productId: number): Observable<any> {
        const userId = this.getUserId();
        return this.http.delete(`${this.apiUrl}/${userId}/remove/${productId}`).pipe(
            tap(() => this.loadCart())
        );
    }

    updateQuantity(productId: number, quantity: number): Observable<any> {
        const userId = this.getUserId();
        return this.http.put(`${this.apiUrl}/${userId}/update`, {
            productId: productId,
            quantity: quantity
        }).pipe(
            tap(() => this.loadCart())
        );
    }

    clearCart(): Observable<any> {
        const userId = this.getUserId();
        return this.http.delete(`${this.apiUrl}/${userId}/clear`).pipe(
            tap(() => this.loadCart())
        );
    }

    isInCart(productId: number): boolean {
        return this.cartItems.some(item => item.productId === productId);
    }

    getCartTotal(): number {
        return this.cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    }

    getCartCount(): number {
        return this.cartItems.reduce((count, item) => count + item.quantity, 0);
    }
}