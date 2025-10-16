import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

interface Employee {
  id: string;
  name: string;
  email: string;
  cpf: string;
  companyName: string;
  createdAt: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'cpf', 'company', 'actions'];
  employees: Employee[] = [];

  ngOnInit(): void {
    // TODO: Load employees from API
    this.loadEmployees();
  }

  loadEmployees(): void {
    // Mock data for now
    this.employees = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@acme.com',
        cpf: '123.456.789-00',
        companyName: 'Acme Corporation',
        createdAt: '2025-01-20'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@global.com',
        cpf: '987.654.321-00',
        companyName: 'Global Industries',
        createdAt: '2025-02-15'
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob.johnson@tech.com',
        cpf: '555.666.777-88',
        companyName: 'Tech Innovations',
        createdAt: '2025-03-01'
      }
    ];
  }

  createEmployee(): void {
    // TODO: Open dialog to create employee
    console.log('Create employee');
  }

  editEmployee(employee: Employee): void {
    // TODO: Open dialog to edit employee
    console.log('Edit employee:', employee);
  }

  deleteEmployee(employee: Employee): void {
    // TODO: Confirm and delete employee
    console.log('Delete employee:', employee);
  }
}
