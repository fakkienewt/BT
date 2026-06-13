import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelProduct } from '../models/model-product';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private apiUrl = 'http://localhost:5195/api';

    constructor(private http: HttpClient) { }

    searchProducts(query: string): Observable<ModelProduct[]> {
        return this.http.get<ModelProduct[]>(`${this.apiUrl}/search?q=${query}`);
    }
}