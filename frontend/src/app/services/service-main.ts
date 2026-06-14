import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelProduct } from '../models/model-product';
import { Observable } from 'rxjs';
import { connectConfig } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class ServiceMain {

  public currentPage: number = 1;
  public hasMore: boolean = true;
  public hasNextPage: boolean = true;

  constructor(private http: HttpClient) { };

  public getPhones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/phones?page=${this.currentPage}`);
  }

  public getLaptops(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/laptops?page=${this.currentPage}`);
  }

  public getComputers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/computers?page=${this.currentPage}`);
  }

  public getTablets(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/tablets?page=${this.currentPage}`);
  }

  public getTVs(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/tv?page=${this.currentPage}`);
  }

  public getMonitory(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/monitory?page=${this.currentPage}`);
  }

  public getPristavki(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/pristavki?page=${this.currentPage}`);
  }

  public getSmartWatches(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/smart-watches?page=${this.currentPage}&pageSize=100`);
  }

  public getFitnessBands(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/fitness-bands?page=${this.currentPage}&pageSize=100`);
  }

  public getGamingKeyboards(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/gaming-keyboards?page=${this.currentPage}&pageSize=100`);
  }

  public getGamingConsoles(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/gaming-consoles?page=${this.currentPage}&pageSize=100`);
  }

  public getGamingMice(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/gaming-mice?page=${this.currentPage}&pageSize=100`);
  }

  public getMicrophones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/microphones?page=${this.currentPage}&pageSize=100`);
  }

  public getSpeakers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/speakers?page=${this.currentPage}&pageSize=100`);
  }

  public getHeadphones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/headphones?page=${this.currentPage}&pageSize=100`);
  }

  public getCablesAndChargers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/cables-chargers?page=${this.currentPage}&pageSize=100`);
  }

  public getBatteries(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/batteries?page=${this.currentPage}&pageSize=100`);
  }

  public getWirelessChargers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/wireless-chargers?page=${this.currentPage}&pageSize=100`);
  }

  public getNextPagePhones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/phones?page=${this.currentPage + 1}`);
  }

  public getNextPageLaptops(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/laptops?page=${this.currentPage + 1}`);
  }

  public getNextPageComputers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/computers?page=${this.currentPage + 1}`);
  }

  public getNextPageTablets(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/tablets?page=${this.currentPage + 1}`);
  }

  public getNewItems(limit: number = 15): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/new?limit=${limit}`);
  }

  resetPage(): void {
    this.currentPage = 1;
    this.hasMore = true;
    this.hasNextPage = true;
  }

  nextPage(): void {
    this.currentPage++;
  }

  backPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  public getProductById(id: number): Observable<ModelProduct> {
    return this.http.get<ModelProduct>(`${connectConfig.baseApiUrl}/products/${id}`);
  }

  searchProducts(query: string): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${connectConfig.baseApiUrl}/search?q=${query}`);
  }
}