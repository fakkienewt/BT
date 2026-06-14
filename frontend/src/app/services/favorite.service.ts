import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { connectConfig } from '../app.config';

export interface FavoriteItem {
    id: number;
    userId: number;
    productId: number;
    productTitle: string;
    productPrice: number;
    productImage: string;
    productBrand: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {
    private apiUrl = `${connectConfig.baseApiUrl}/favorites`;
    private favoriteItems: FavoriteItem[] = [];
    private favoriteSubject = new BehaviorSubject<FavoriteItem[]>([]);

    constructor(private http: HttpClient) {
        this.loadFavorites();
    }

    private getUserId(): number {
        const userId = localStorage.getItem('userId');
        if (!userId) return 0;
        return parseInt(userId);
    }

    loadFavorites(): void {
        const userId = this.getUserId();
        if (userId === 0) {
            this.favoriteItems = [];
            this.favoriteSubject.next([]);
            return;
        }

        this.http.get<FavoriteItem[]>(`${this.apiUrl}/${userId}`).subscribe({
            next: (items) => {
                this.favoriteItems = items;
                this.favoriteSubject.next(this.favoriteItems);
            },
            error: (err) => {
                console.error('Error loading favorites:', err);
                this.favoriteItems = [];
                this.favoriteSubject.next([]);
            }
        });
    }

    getFavorites(): Observable<FavoriteItem[]> {
        return this.favoriteSubject.asObservable();
    }

    getFavoriteItems(): FavoriteItem[] {
        return this.favoriteItems;
    }

    addToFavorite(productId: number): Observable<any> {
        const userId = this.getUserId();
        if (userId === 0) {
            alert('Пожалуйста, войдите в аккаунт');
            return new Observable();
        }

        return this.http.post(`${this.apiUrl}/${userId}/add`, { productId }).pipe(
            tap(() => this.loadFavorites())
        );
    }

    removeFromFavorite(productId: number): Observable<any> {
        const userId = this.getUserId();
        return this.http.delete(`${this.apiUrl}/${userId}/remove/${productId}`).pipe(
            tap(() => this.loadFavorites())
        );
    }

    isInFavorite(productId: number): boolean {
        return this.favoriteItems.some(item => item.productId === productId);
    }
}