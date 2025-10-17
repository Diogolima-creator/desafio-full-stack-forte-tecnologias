import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Asset, AssetStatus } from '../../models/asset.model';
import { AssetService } from '../../services/asset.service';
import { AssetDialogComponent } from '../../components/dialogs/asset-dialog.component';

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
    MatSnackBarModule,
    MatDialogModule
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
    const dialogRef = this.dialog.open(AssetDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assetService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Asset created successfully', 'Close', { duration: 3000 });
            this.loadAssets();
          },
          error: (error) => {
            console.error('Error creating asset:', error);
            this.snackBar.open(error.error?.message || 'Error creating asset', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editAsset(asset: Asset): void {
    const dialogRef = this.dialog.open(AssetDialogComponent, {
      width: '500px',
      data: { asset, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assetService.update(asset.id, result).subscribe({
          next: () => {
            this.snackBar.open('Asset updated successfully', 'Close', { duration: 3000 });
            this.loadAssets();
          },
          error: (error) => {
            console.error('Error updating asset:', error);
            this.snackBar.open(error.error?.message || 'Error updating asset', 'Close', { duration: 3000 });
          }
        });
      }
    });
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
