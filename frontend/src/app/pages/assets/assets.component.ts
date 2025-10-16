import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Asset, AssetStatus } from '../../models/asset.model';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss'
})
export class AssetsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'status', 'createdAt', 'actions'];
  assets: Asset[] = [];
  loading = false;

  constructor(
    private assetService: AssetService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.loading = true;
    this.assetService.getAll().subscribe({
      next: (assets) => {
        this.assets = assets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.snackBar.open('Error loading assets', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: AssetStatus): string {
    const statusMap: Record<AssetStatus, string> = {
      [AssetStatus.DISPONIVEL]: 'Available',
      [AssetStatus.EM_USO]: 'In Use',
      [AssetStatus.EM_MANUTENCAO]: 'Maintenance'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: AssetStatus): string {
    const classMap: Record<AssetStatus, string> = {
      [AssetStatus.DISPONIVEL]: 'status-available',
      [AssetStatus.EM_USO]: 'status-in-use',
      [AssetStatus.EM_MANUTENCAO]: 'status-maintenance'
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
    if (confirm(`Are you sure you want to delete ${asset.name}?`)) {
      this.assetService.delete(asset.id).subscribe({
        next: () => {
          this.snackBar.open('Asset deleted successfully', 'Close', { duration: 3000 });
          this.loadAssets();
        },
        error: (error) => {
          console.error('Error deleting asset:', error);
          this.snackBar.open('Error deleting asset', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
