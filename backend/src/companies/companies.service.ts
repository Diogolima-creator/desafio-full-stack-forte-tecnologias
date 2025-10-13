import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const existingCompany = await this.companiesRepository.findByCnpj(
      createCompanyDto.cnpj,
    );

    if (existingCompany) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    return this.companiesRepository.create(createCompanyDto);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.findAll();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne(id);

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    await this.findOne(id);

    if (updateCompanyDto.cnpj) {
      const existingCompany = await this.companiesRepository.findByCnpj(
        updateCompanyDto.cnpj,
      );

      if (existingCompany && existingCompany.id !== id) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    return this.companiesRepository.update(id, updateCompanyDto);
  }

  async remove(id: string): Promise<Company> {
    await this.findOne(id);

    return this.companiesRepository.remove(id);
  }
}
