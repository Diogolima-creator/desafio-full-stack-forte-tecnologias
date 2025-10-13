import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeesService } from '../../../src/employees/employees.service';
import { EmployeesRepository } from '../../../src/employees/employees.repository';
import { CompaniesService } from '../../../src/companies/companies.service';
import { CreateEmployeeDto } from '../../../src/employees/dto/create-employee.dto';
import { UpdateEmployeeDto } from '../../../src/employees/dto/update-employee.dto';
import { Employee, Company } from '@prisma/client';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repository: EmployeesRepository;
  let companiesService: CompaniesService;

  const mockCompany: Company = {
    id: 'company-uuid-123',
    name: 'Tech Corp',
    cnpj: '12345678901234',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockEmployee: Employee = {
    id: 'employee-uuid-123',
    name: 'João Silva',
    email: 'joao.silva@example.com',
    cpf: '12345678901',
    companyId: 'company-uuid-123',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockEmployeesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    findByCpf: jest.fn(),
    findByCompanyId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCompaniesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: EmployeesRepository,
          useValue: mockEmployeesRepository,
        },
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    repository = module.get<EmployeesRepository>(EmployeesRepository);
    companiesService = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEmployeeDto: CreateEmployeeDto = {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      cpf: '12345678901',
      companyId: 'company-uuid-123',
    };

    it('should create an employee successfully', async () => {
      mockCompaniesService.findOne.mockResolvedValue(mockCompany);
      mockEmployeesRepository.findByEmail.mockResolvedValue(null);
      mockEmployeesRepository.findByCpf.mockResolvedValue(null);
      mockEmployeesRepository.create.mockResolvedValue(mockEmployee);

      const result = await service.create(createEmployeeDto);

      expect(companiesService.findOne).toHaveBeenCalledWith(
        createEmployeeDto.companyId,
      );
      expect(repository.findByEmail).toHaveBeenCalledWith(
        createEmployeeDto.email,
      );
      expect(repository.findByCpf).toHaveBeenCalledWith(createEmployeeDto.cpf);
      expect(repository.create).toHaveBeenCalledWith(createEmployeeDto);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockCompaniesService.findOne.mockRejectedValue(
        new NotFoundException('Empresa não encontrada'),
      );

      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        'Empresa não encontrada',
      );

      expect(companiesService.findOne).toHaveBeenCalledWith(
        createEmployeeDto.companyId,
      );
      expect(repository.findByEmail).not.toHaveBeenCalled();
      expect(repository.findByCpf).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockCompaniesService.findOne.mockResolvedValue(mockCompany);
      mockEmployeesRepository.findByEmail.mockResolvedValue(mockEmployee);

      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        'Email já cadastrado',
      );

      expect(companiesService.findOne).toHaveBeenCalledWith(
        createEmployeeDto.companyId,
      );
      expect(repository.findByEmail).toHaveBeenCalledWith(
        createEmployeeDto.email,
      );
      expect(repository.findByCpf).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if CPF already exists', async () => {
      mockCompaniesService.findOne.mockResolvedValue(mockCompany);
      mockEmployeesRepository.findByEmail.mockResolvedValue(null);
      mockEmployeesRepository.findByCpf.mockResolvedValue(mockEmployee);

      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        'CPF já cadastrado',
      );

      expect(companiesService.findOne).toHaveBeenCalledWith(
        createEmployeeDto.companyId,
      );
      expect(repository.findByEmail).toHaveBeenCalledWith(
        createEmployeeDto.email,
      );
      expect(repository.findByCpf).toHaveBeenCalledWith(createEmployeeDto.cpf);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      const mockEmployees: Employee[] = [
        mockEmployee,
        {
          ...mockEmployee,
          id: 'employee-uuid-456',
          name: 'Maria Santos',
          email: 'maria@example.com',
          cpf: '98765432109',
        },
      ];

      mockEmployeesRepository.findAll.mockResolvedValue(mockEmployees);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockEmployees);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array if no employees exist', async () => {
      mockEmployeesRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne(mockEmployee.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      mockEmployeesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Funcionário não encontrado',
      );

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('findByCompany', () => {
    it('should return employees by company id', async () => {
      const mockEmployees: Employee[] = [mockEmployee];

      mockCompaniesService.findOne.mockResolvedValue(mockCompany);
      mockEmployeesRepository.findByCompanyId.mockResolvedValue(mockEmployees);

      const result = await service.findByCompany(mockCompany.id);

      expect(companiesService.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(repository.findByCompanyId).toHaveBeenCalledWith(mockCompany.id);
      expect(result).toEqual(mockEmployees);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockCompaniesService.findOne.mockRejectedValue(
        new NotFoundException('Empresa não encontrada'),
      );

      await expect(service.findByCompany('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByCompany('non-existent-id')).rejects.toThrow(
        'Empresa não encontrada',
      );

      expect(companiesService.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.findByCompanyId).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateEmployeeDto: UpdateEmployeeDto = {
      name: 'João Silva Updated',
    };

    it('should update an employee successfully', async () => {
      const updatedEmployee = { ...mockEmployee, ...updateEmployeeDto };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(mockEmployee.id, updateEmployeeDto);

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.update).toHaveBeenCalledWith(
        mockEmployee.id,
        updateEmployeeDto,
      );
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      mockEmployeesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateEmployeeDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent-id', updateEmployeeDto),
      ).rejects.toThrow('Funcionário não encontrado');

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should validate new company exists when updating companyId', async () => {
      const updateWithCompany: UpdateEmployeeDto = {
        companyId: 'new-company-id',
      };

      const updatedEmployee = { ...mockEmployee, ...updateWithCompany };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockCompaniesService.findOne.mockResolvedValue(mockCompany);
      mockEmployeesRepository.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(mockEmployee.id, updateWithCompany);

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(companiesService.findOne).toHaveBeenCalledWith('new-company-id');
      expect(repository.update).toHaveBeenCalledWith(
        mockEmployee.id,
        updateWithCompany,
      );
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw NotFoundException if new company does not exist', async () => {
      const updateWithCompany: UpdateEmployeeDto = {
        companyId: 'non-existent-company',
      };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockCompaniesService.findOne.mockRejectedValue(
        new NotFoundException('Empresa não encontrada'),
      );

      await expect(
        service.update(mockEmployee.id, updateWithCompany),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(mockEmployee.id, updateWithCompany),
      ).rejects.toThrow('Empresa não encontrada');

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(companiesService.findOne).toHaveBeenCalledWith(
        'non-existent-company',
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updating to existing email of another employee', async () => {
      const updateWithEmail: UpdateEmployeeDto = {
        email: 'another@example.com',
      };

      const anotherEmployee: Employee = {
        ...mockEmployee,
        id: 'another-employee-id',
        email: 'another@example.com',
      };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.findByEmail.mockResolvedValue(anotherEmployee);

      await expect(
        service.update(mockEmployee.id, updateWithEmail),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockEmployee.id, updateWithEmail),
      ).rejects.toThrow('Email já cadastrado');

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findByEmail).toHaveBeenCalledWith(
        updateWithEmail.email,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to the same email (same employee)', async () => {
      const updateWithSameEmail: UpdateEmployeeDto = {
        name: 'Updated Name',
        email: mockEmployee.email,
      };

      const updatedEmployee = { ...mockEmployee, ...updateWithSameEmail };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.findByEmail.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(
        mockEmployee.id,
        updateWithSameEmail,
      );

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findByEmail).toHaveBeenCalledWith(mockEmployee.email);
      expect(repository.update).toHaveBeenCalledWith(
        mockEmployee.id,
        updateWithSameEmail,
      );
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw ConflictException if updating to existing CPF of another employee', async () => {
      const updateWithCpf: UpdateEmployeeDto = {
        cpf: '98765432109',
      };

      const anotherEmployee: Employee = {
        ...mockEmployee,
        id: 'another-employee-id',
        cpf: '98765432109',
      };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.findByCpf.mockResolvedValue(anotherEmployee);

      await expect(
        service.update(mockEmployee.id, updateWithCpf),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockEmployee.id, updateWithCpf),
      ).rejects.toThrow('CPF já cadastrado');

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findByCpf).toHaveBeenCalledWith(updateWithCpf.cpf);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to the same CPF (same employee)', async () => {
      const updateWithSameCpf: UpdateEmployeeDto = {
        name: 'Updated Name',
        cpf: mockEmployee.cpf,
      };

      const updatedEmployee = { ...mockEmployee, ...updateWithSameCpf };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.findByCpf.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(mockEmployee.id, updateWithSameCpf);

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findByCpf).toHaveBeenCalledWith(mockEmployee.cpf);
      expect(repository.update).toHaveBeenCalledWith(
        mockEmployee.id,
        updateWithSameCpf,
      );
      expect(result).toEqual(updatedEmployee);
    });

    it('should not check email uniqueness if email is not being updated', async () => {
      const updateWithoutEmail: UpdateEmployeeDto = {
        name: 'Only Name Update',
      };

      const updatedEmployee = { ...mockEmployee, ...updateWithoutEmail };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(
        mockEmployee.id,
        updateWithoutEmail,
      );

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findByEmail).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        mockEmployee.id,
        updateWithoutEmail,
      );
      expect(result).toEqual(updatedEmployee);
    });

    it('should not check CPF uniqueness if CPF is not being updated', async () => {
      const updateWithoutCpf: UpdateEmployeeDto = {
        name: 'Only Name Update',
      };

      const updatedEmployee = { ...mockEmployee, ...updateWithoutCpf };

      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(mockEmployee.id, updateWithoutCpf);

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findByCpf).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        mockEmployee.id,
        updateWithoutCpf,
      );
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe('remove', () => {
    it('should remove an employee successfully', async () => {
      mockEmployeesRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeesRepository.remove.mockResolvedValue(mockEmployee);

      const result = await service.remove(mockEmployee.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.remove).toHaveBeenCalledWith(mockEmployee.id);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      mockEmployeesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Funcionário não encontrado',
      );

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
