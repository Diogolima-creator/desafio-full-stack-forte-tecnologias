import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Company } from '../../models/company.model';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'cnpj', 'createdAt', 'actions'];
  companies: Company[] = [];
  loading = false;

  constructor(
    private companyService: CompanyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.companyService.getAll().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.snackBar.open('Error loading companies', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  createCompany(): void {
    // TODO: Open dialog to create company
    console.log('Create company');
  }

  editCompany(company: Company): void {
    // TODO: Open dialog to edit company
    console.log('Edit company:', company);
  }

  deleteCompany(company: Company): void {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      this.companyService.delete(company.id).subscribe({
        next: () => {
          this.snackBar.open('Company deleted successfully', 'Close', { duration: 3000 });
          this.loadCompanies();
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          this.snackBar.open('Error deleting company', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
