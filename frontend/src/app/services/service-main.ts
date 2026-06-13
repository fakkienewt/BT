import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelProduct } from '../models/model-product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceMain {

  private baseURL = "http://localhost:5195/api";
  public currentPage: number = 1;
  public hasMore: boolean = true;
  public hasNextPage: boolean = true;

  constructor(private http: HttpClient) { };

  public getPhones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/phones?page=${this.currentPage}`);
  }

  public getLaptops(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/laptops?page=${this.currentPage}`);
  }

  public getComputers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/computers?page=${this.currentPage}`);
  }

  public getTablets(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/tablets?page=${this.currentPage}`);
  }

  public getTVs(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/tv?page=${this.currentPage}`);
  }

  public getMonitory(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/monitory?page=${this.currentPage}`);
  }

  public getPristavki(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/pristavki?page=${this.currentPage}`);
  }

  public getSmartWatches(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/smart-watches?page=${this.currentPage}&pageSize=100`);
  }

  public getFitnessBands(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/fitness-bands?page=${this.currentPage}&pageSize=100`);
  }

  public getGamingKeyboards(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/gaming-keyboards?page=${this.currentPage}&pageSize=100`);
  }

  public getGamingConsoles(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/gaming-consoles?page=${this.currentPage}&pageSize=100`);
  }

  public getGamingMice(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/gaming-mice?page=${this.currentPage}&pageSize=100`);
  }

  public getMicrophones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/microphones?page=${this.currentPage}&pageSize=100`);
  }

  public getSpeakers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/speakers?page=${this.currentPage}&pageSize=100`);
  }

  public getHeadphones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/headphones?page=${this.currentPage}&pageSize=100`);
  }

  public getCablesAndChargers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/cables-chargers?page=${this.currentPage}&pageSize=100`);
  }

  public getBatteries(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/batteries?page=${this.currentPage}&pageSize=100`);
  }

  public getWirelessChargers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/wireless-chargers?page=${this.currentPage}&pageSize=100`);
  }

  public getNextPagePhones(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/phones?page=${this.currentPage + 1}`);
  }

  public getNextPageLaptops(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/laptops?page=${this.currentPage + 1}`);
  }

  public getNextPageComputers(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/computers?page=${this.currentPage + 1}`);
  }

  public getNextPageTablets(): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/tablets?page=${this.currentPage + 1}`);
  }

  public getNewItems(limit: number = 15): Observable<ModelProduct[]> {
    return this.http.get<ModelProduct[]>(`${this.baseURL}/new?limit=${limit}`);
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
    return this.http.get<ModelProduct>(`${this.baseURL}/products/${id}`);
  }
}