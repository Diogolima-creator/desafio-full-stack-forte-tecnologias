import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from '@prisma/client';

@Injectable()
export class EmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.create({
      data: createEmployeeDto,
    });
  }

  async findAll(): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      include: {
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { email },
    });
  }

  async findByCpf(cpf: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { cpf },
    });
  }

  async findByCompanyId(companyId: string): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: { companyId },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string): Promise<Employee> {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
