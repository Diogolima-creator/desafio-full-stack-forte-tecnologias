import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  createdAt: string;
}

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'cnpj', 'createdAt', 'actions'];
  companies: Company[] = [];

  ngOnInit(): void {
    // TODO: Load companies from API
    this.loadCompanies();
  }

  loadCompanies(): void {
    // Mock data for now
    this.companies = [
      {
        id: '1',
        name: 'Acme Corporation',
        cnpj: '12.345.678/0001-90',
        createdAt: '2025-01-15'
      },
      {
        id: '2',
        name: 'Global Industries',
        cnpj: '98.765.432/0001-10',
        createdAt: '2025-02-20'
      },
      {
        id: '3',
        name: 'Tech Innovations',
        cnpj: '55.666.777/0001-88',
        createdAt: '2025-03-10'
      }
    ];
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
    // TODO: Confirm and delete company
    console.log('Delete company:', company);
  }
}
