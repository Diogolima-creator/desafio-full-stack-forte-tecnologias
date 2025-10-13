import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from '../../../src/companies/companies.service';
import { CompaniesRepository } from '../../../src/companies/companies.repository';
import { CreateCompanyDto } from '../../../src/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '../../../src/companies/dto/update-company.dto';
import { Company } from '@prisma/client';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: CompaniesRepository;

  const mockCompany: Company = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Forte Tecnologias',
    cnpj: '12345678901234',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockCompaniesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCnpj: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: CompaniesRepository,
          useValue: mockCompaniesRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    repository = module.get<CompaniesRepository>(CompaniesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCompanyDto: CreateCompanyDto = {
      name: 'Forte Tecnologias',
      cnpj: '12345678901234',
    };

    it('should create a company successfully', async () => {
      mockCompaniesRepository.findByCnpj.mockResolvedValue(null);
      mockCompaniesRepository.create.mockResolvedValue(mockCompany);

      const result = await service.create(createCompanyDto);

      expect(repository.findByCnpj).toHaveBeenCalledWith(createCompanyDto.cnpj);
      expect(repository.create).toHaveBeenCalledWith(createCompanyDto);
      expect(result).toEqual(mockCompany);
    });

    it('should throw ConflictException if CNPJ already exists', async () => {
      mockCompaniesRepository.findByCnpj.mockResolvedValue(mockCompany);

      await expect(service.create(createCompanyDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createCompanyDto)).rejects.toThrow(
        'CNPJ já cadastrado',
      );

      expect(repository.findByCnpj).toHaveBeenCalledWith(createCompanyDto.cnpj);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of companies', async () => {
      const mockCompanies: Company[] = [
        mockCompany,
        {
          ...mockCompany,
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Another Company',
          cnpj: '98765432109876',
        },
      ];

      mockCompaniesRepository.findAll.mockResolvedValue(mockCompanies);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCompanies);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array if no companies exist', async () => {
      mockCompaniesRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      mockCompaniesRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.findOne(mockCompany.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockCompaniesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Empresa não encontrada',
      );

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('update', () => {
    const updateCompanyDto: UpdateCompanyDto = {
      name: 'Forte Tecnologias Updated',
    };

    it('should update a company successfully', async () => {
      const updatedCompany = { ...mockCompany, ...updateCompanyDto };

      mockCompaniesRepository.findOne.mockResolvedValue(mockCompany);
      mockCompaniesRepository.update.mockResolvedValue(updatedCompany);

      const result = await service.update(mockCompany.id, updateCompanyDto);

      expect(repository.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(repository.update).toHaveBeenCalledWith(
        mockCompany.id,
        updateCompanyDto,
      );
      expect(result).toEqual(updatedCompany);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockCompaniesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateCompanyDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent-id', updateCompanyDto),
      ).rejects.toThrow('Empresa não encontrada');

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updating to existing CNPJ of another company', async () => {
      const updateWithCnpj: UpdateCompanyDto = {
        cnpj: '98765432109876',
      };

      const anotherCompany: Company = {
        ...mockCompany,
        id: 'another-id',
        cnpj: '98765432109876',
      };

      mockCompaniesRepository.findOne.mockResolvedValue(mockCompany);
      mockCompaniesRepository.findByCnpj.mockResolvedValue(anotherCompany);

      await expect(
        service.update(mockCompany.id, updateWithCnpj),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockCompany.id, updateWithCnpj),
      ).rejects.toThrow('CNPJ já cadastrado');

      expect(repository.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(repository.findByCnpj).toHaveBeenCalledWith(updateWithCnpj.cnpj);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to the same CNPJ (same company)', async () => {
      const updateWithSameCnpj: UpdateCompanyDto = {
        name: 'Updated Name',
        cnpj: mockCompany.cnpj,
      };

      const updatedCompany = { ...mockCompany, ...updateWithSameCnpj };

      mockCompaniesRepository.findOne.mockResolvedValue(mockCompany);
      mockCompaniesRepository.findByCnpj.mockResolvedValue(mockCompany);
      mockCompaniesRepository.update.mockResolvedValue(updatedCompany);

      const result = await service.update(mockCompany.id, updateWithSameCnpj);

      expect(repository.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(repository.findByCnpj).toHaveBeenCalledWith(mockCompany.cnpj);
      expect(repository.update).toHaveBeenCalledWith(
        mockCompany.id,
        updateWithSameCnpj,
      );
      expect(result).toEqual(updatedCompany);
    });

    it('should not check CNPJ uniqueness if CNPJ is not being updated', async () => {
      const updateWithoutCnpj: UpdateCompanyDto = {
        name: 'Only Name Update',
      };

      const updatedCompany = { ...mockCompany, ...updateWithoutCnpj };

      mockCompaniesRepository.findOne.mockResolvedValue(mockCompany);
      mockCompaniesRepository.update.mockResolvedValue(updatedCompany);

      const result = await service.update(mockCompany.id, updateWithoutCnpj);

      expect(repository.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(repository.findByCnpj).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        mockCompany.id,
        updateWithoutCnpj,
      );
      expect(result).toEqual(updatedCompany);
    });
  });

  describe('remove', () => {
    it('should remove a company successfully', async () => {
      mockCompaniesRepository.findOne.mockResolvedValue(mockCompany);
      mockCompaniesRepository.remove.mockResolvedValue(mockCompany);

      const result = await service.remove(mockCompany.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(repository.remove).toHaveBeenCalledWith(mockCompany.id);
      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockCompaniesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Empresa não encontrada',
      );

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
