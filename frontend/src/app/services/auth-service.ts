import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelUser } from '../models/model-user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5195/api/Auth';

    constructor(private http: HttpClient) { }

    getCurrentUser(): Observable<ModelUser> {
        const userId = localStorage.getItem('userId');
        console.log('AuthService: getCurrentUser called, userId:', userId);

        if (!userId) {
            throw new Error('User not logged in - no userId in localStorage');
        }

        const url = `${this.apiUrl}/${userId}`;
        console.log('AuthService: making GET request to:', url);

        return this.http.get<ModelUser>(url);
    }

    updateProfile(user: ModelUser): Observable<any> {
        const userId = localStorage.getItem('userId');
        console.log('AuthService: updateProfile called, userId:', userId);

        if (!userId) {
            throw new Error('User not logged in - no userId in localStorage');
        }

        const updateData = {
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber,
            deliveryAddress: user.deliveryAddress,
            avatarUrl: user.avatarUrl,
            password: ''
        };

        const url = `${this.apiUrl}/${userId}`;
        console.log('AuthService: making PUT request to:', url, 'with data:', updateData);

        return this.http.put(url, updateData);
    }

    login(credentials: { email: string; password: string }): Observable<any> {
        console.log('AuthService: login called for email:', credentials.email);
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    register(userData: any): Observable<any> {
        console.log('AuthService: register called for email:', userData.email);
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    deleteAccount(userId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${userId}`);
    }
}