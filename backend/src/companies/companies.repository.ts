import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { cnpj },
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string): Promise<Company> {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
