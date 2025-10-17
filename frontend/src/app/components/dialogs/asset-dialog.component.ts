import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Asset, AssetStatus } from '../../models/asset.model';

export interface AssetDialogData {
  asset?: Asset;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-asset-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './asset-dialog.component.html',
  styleUrl: './asset-dialog.component.scss'
})
export class AssetDialogComponent {
  form: FormGroup;
  mode: 'create' | 'edit';
  statusOptions = [
    { value: AssetStatus.DISPONIVEL, label: 'Available' },
    { value: AssetStatus.EM_MANUTENCAO, label: 'Maintenance' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AssetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssetDialogData
  ) {
    this.mode = data.mode;
    this.form = this.fb.group({
      name: [data.asset?.name || '', [Validators.required, Validators.minLength(3)]],
      type: [data.asset?.type || '', [Validators.required]],
      status: [data.asset?.status || AssetStatus.DISPONIVEL, [Validators.required]]
    });
  }

  get title(): string {
    return this.mode === 'create' ? 'Create Asset' : 'Edit Asset';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
