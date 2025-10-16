import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssetEmployee, AssignAssetDto, UnassignAssetDto } from '../models/asset-assignment.model';
import { Asset } from '../models/asset.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetAssignmentService {
  private apiUrl = `${environment.apiUrl}/asset-assignments`;

  constructor(private http: HttpClient) {}

  assign(data: AssignAssetDto): Observable<AssetEmployee> {
    return this.http.post<AssetEmployee>(`${this.apiUrl}/assign`, data);
  }

  unassign(data: UnassignAssetDto): Observable<AssetEmployee> {
    return this.http.post<AssetEmployee>(`${this.apiUrl}/unassign`, data);
  }

  getAssetsByEmployee(employeeId: string): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.apiUrl}/employee/${employeeId}`);
  }
}
