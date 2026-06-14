import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelProduct } from '../models/model-product';
import { connectConfig } from '../app.config';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor(private http: HttpClient) { }

    searchProducts(query: string): Observable<ModelProduct[]> {
        return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/search?q=${query}`);
    }
}