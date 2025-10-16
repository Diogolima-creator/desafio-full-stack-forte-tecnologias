import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'DISPONIVEL' | 'EM_USO' | 'EM_MANUTENCAO';
  createdAt: string;
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss'
})
export class AssetsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'status', 'createdAt', 'actions'];
  assets: Asset[] = [];

  ngOnInit(): void {
    // TODO: Load assets from API
    this.loadAssets();
  }

  loadAssets(): void {
    // Mock data for now
    this.assets = [
      {
        id: '1',
        name: 'Dell Laptop XPS 15',
        type: 'Notebook',
        status: 'EM_USO',
        createdAt: '2025-01-10'
      },
      {
        id: '2',
        name: 'iPhone 14 Pro',
        type: 'Smartphone',
        status: 'DISPONIVEL',
        createdAt: '2025-02-05'
      },
      {
        id: '3',
        name: 'MacBook Pro 16"',
        type: 'Notebook',
        status: 'EM_MANUTENCAO',
        createdAt: '2025-03-12'
      },
      {
        id: '4',
        name: 'Samsung Monitor 27"',
        type: 'Monitor',
        status: 'DISPONIVEL',
        createdAt: '2025-04-01'
      }
    ];
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'DISPONIVEL': 'Available',
      'EM_USO': 'In Use',
      'EM_MANUTENCAO': 'Maintenance'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'DISPONIVEL': 'status-available',
      'EM_USO': 'status-in-use',
      'EM_MANUTENCAO': 'status-maintenance'
    };
    return classMap[status] || '';
  }

  createAsset(): void {
    // TODO: Open dialog to create asset
    console.log('Create asset');
  }

  editAsset(asset: Asset): void {
    // TODO: Open dialog to edit asset
    console.log('Edit asset:', asset);
  }

  deleteAsset(asset: Asset): void {
    // TODO: Confirm and delete asset
    console.log('Delete asset:', asset);
  }
}
