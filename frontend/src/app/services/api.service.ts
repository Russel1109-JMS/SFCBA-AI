import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  predictSales(month: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/predict_sales`, { month });
  }

  segmentCustomers(features: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/segment_customers`, { features });
  }
}

