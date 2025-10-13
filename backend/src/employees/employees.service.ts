import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EmployeesRepository } from './employees.repository';
import { CompaniesService } from '../companies/companies.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly companiesService: CompaniesService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    await this.companiesService.findOne(createEmployeeDto.companyId);

    const existingEmail = await this.employeesRepository.findByEmail(
      createEmployeeDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    const existingCpf = await this.employeesRepository.findByCpf(
      createEmployeeDto.cpf,
    );
    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado');
    }

    return this.employeesRepository.create(createEmployeeDto);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeesRepository.findAll();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne(id);

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employee;
  }

  async findByCompany(companyId: string): Promise<Employee[]> {
    await this.companiesService.findOne(companyId);

    return this.employeesRepository.findByCompanyId(companyId);
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    await this.findOne(id);

    if (updateEmployeeDto.companyId) {
      await this.companiesService.findOne(updateEmployeeDto.companyId);
    }

    if (updateEmployeeDto.email) {
      const existingEmail = await this.employeesRepository.findByEmail(
        updateEmployeeDto.email,
      );

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    if (updateEmployeeDto.cpf) {
      const existingCpf = await this.employeesRepository.findByCpf(
        updateEmployeeDto.cpf,
      );

      if (existingCpf && existingCpf.id !== id) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    return this.employeesRepository.update(id, updateEmployeeDto);
  }

  async remove(id: string): Promise<Employee> {
    await this.findOne(id);

    return this.employeesRepository.remove(id);
  }
}
