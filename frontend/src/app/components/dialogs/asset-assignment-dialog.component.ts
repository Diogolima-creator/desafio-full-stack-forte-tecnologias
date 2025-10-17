import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Asset, AssetStatus } from '../../models/asset.model';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

export interface AssetAssignmentDialogData {
  asset: Asset;
  mode: 'assign' | 'status';
}

@Component({
  selector: 'app-asset-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './asset-assignment-dialog.component.html',
  styleUrl: './asset-assignment-dialog.component.scss'
})
export class AssetAssignmentDialogComponent implements OnInit {
  form: FormGroup;
  mode: 'assign' | 'status';
  asset: Asset;
  employees: Employee[] = [];
  statusOptions = [
    { value: AssetStatus.DISPONIVEL, label: 'Available' },
    { value: AssetStatus.EM_MANUTENCAO, label: 'Maintenance' }
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<AssetAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssetAssignmentDialogData
  ) {
    this.mode = data.mode;
    this.asset = data.asset;

    if (this.mode === 'assign') {
      this.form = this.fb.group({
        employeeId: ['', [Validators.required]]
      });
    } else {
      this.form = this.fb.group({
        status: [data.asset.status, [Validators.required]]
      });
    }
  }

  ngOnInit(): void {
    if (this.mode === 'assign') {
      this.loadEmployees();
    }
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  get title(): string {
    return this.mode === 'assign' ? `Assign ${this.asset.name}` : `Change Status: ${this.asset.name}`;
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
