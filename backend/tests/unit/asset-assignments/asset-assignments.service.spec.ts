import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AssetAssignmentsService } from '../../../src/asset-assignments/asset-assignments.service';
import { AssetAssignmentsRepository } from '../../../src/asset-assignments/asset-assignments.repository';
import { AssetsService } from '../../../src/assets/assets.service';
import { EmployeesService } from '../../../src/employees/employees.service';
import { AssignAssetDto } from '../../../src/asset-assignments/dto/assign-asset.dto';
import { UnassignAssetDto } from '../../../src/asset-assignments/dto/unassign-asset.dto';
import { Asset, Employee, AssetEmployee, AssetStatus } from '@prisma/client';

describe('AssetAssignmentsService', () => {
  let service: AssetAssignmentsService;
  let repository: AssetAssignmentsRepository;
  let assetsService: AssetsService;
  let employeesService: EmployeesService;

  const mockEmployee: Employee = {
    id: 'employee-uuid-123',
    name: 'João Silva',
    email: 'joao@example.com',
    cpf: '12345678901',
    companyId: 'company-uuid-123',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockNotebook: Asset = {
    id: 'notebook-uuid-123',
    name: 'Dell Notebook Latitude 5420',
    type: 'Notebook',
    status: AssetStatus.DISPONIVEL,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockMouse: Asset = {
    id: 'mouse-uuid-456',
    name: 'Logitech Mouse',
    type: 'Mouse',
    status: AssetStatus.DISPONIVEL,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockAssignment: AssetEmployee = {
    id: 'assignment-uuid-123',
    assetId: mockNotebook.id,
    employeeId: mockEmployee.id,
    assignedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockAssetAssignmentsRepository = {
    assign: jest.fn(),
    unassign: jest.fn(),
    findAssignment: jest.fn(),
    findAssetsByEmployee: jest.fn(),
    countNotebooksByEmployee: jest.fn(),
  };

  const mockAssetsService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockEmployeesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetAssignmentsService,
        {
          provide: AssetAssignmentsRepository,
          useValue: mockAssetAssignmentsRepository,
        },
        {
          provide: AssetsService,
          useValue: mockAssetsService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<AssetAssignmentsService>(AssetAssignmentsService);
    repository = module.get<AssetAssignmentsRepository>(
      AssetAssignmentsRepository,
    );
    assetsService = module.get<AssetsService>(AssetsService);
    employeesService = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assign', () => {
    const assignAssetDto: AssignAssetDto = {
      assetId: mockNotebook.id,
      employeeId: mockEmployee.id,
    };

    it('should assign asset to employee successfully', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(null);
      mockAssetAssignmentsRepository.countNotebooksByEmployee.mockResolvedValue(
        0,
      );
      mockAssetAssignmentsRepository.assign.mockResolvedValue(mockAssignment);
      mockAssetsService.update.mockResolvedValue({
        ...mockNotebook,
        status: AssetStatus.EM_USO,
      });

      const result = await service.assign(assignAssetDto);

      expect(assetsService.findOne).toHaveBeenCalledWith(assignAssetDto.assetId);
      expect(employeesService.findOne).toHaveBeenCalledWith(
        assignAssetDto.employeeId,
      );
      expect(repository.findAssignment).toHaveBeenCalledWith(
        assignAssetDto.assetId,
        assignAssetDto.employeeId,
      );
      expect(repository.countNotebooksByEmployee).toHaveBeenCalledWith(
        assignAssetDto.employeeId,
      );
      expect(repository.assign).toHaveBeenCalledWith(
        assignAssetDto.assetId,
        assignAssetDto.employeeId,
      );
      expect(assetsService.update).toHaveBeenCalledWith(assignAssetDto.assetId, {
        status: AssetStatus.EM_USO,
      });
      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      mockAssetsService.findOne.mockRejectedValue(
        new NotFoundException('Ativo não encontrado'),
      );

      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        'Ativo não encontrado',
      );

      expect(assetsService.findOne).toHaveBeenCalledWith(assignAssetDto.assetId);
      expect(repository.assign).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockRejectedValue(
        new NotFoundException('Funcionário não encontrado'),
      );

      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        'Funcionário não encontrado',
      );

      expect(assetsService.findOne).toHaveBeenCalledWith(assignAssetDto.assetId);
      expect(employeesService.findOne).toHaveBeenCalledWith(
        assignAssetDto.employeeId,
      );
      expect(repository.assign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if asset is not available (EM_USO)', async () => {
      const assetInUse = { ...mockNotebook, status: AssetStatus.EM_USO };

      mockAssetsService.findOne.mockResolvedValue(assetInUse);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        'Ativo não está disponível',
      );

      expect(assetsService.findOne).toHaveBeenCalledWith(assignAssetDto.assetId);
      expect(employeesService.findOne).toHaveBeenCalledWith(
        assignAssetDto.employeeId,
      );
      expect(repository.assign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if asset is in maintenance (EM_MANUTENCAO)', async () => {
      const assetInMaintenance = {
        ...mockNotebook,
        status: AssetStatus.EM_MANUTENCAO,
      };

      mockAssetsService.findOne.mockResolvedValue(assetInMaintenance);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        'Ativo não está disponível',
      );

      expect(repository.assign).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if asset is already assigned to employee', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(
        mockAssignment,
      );

      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        'Ativo já está atribuído a este funcionário',
      );

      expect(repository.findAssignment).toHaveBeenCalledWith(
        assignAssetDto.assetId,
        assignAssetDto.employeeId,
      );
      expect(repository.assign).not.toHaveBeenCalled();
    });

    it('should enforce one notebook per employee rule', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(null);
      mockAssetAssignmentsRepository.countNotebooksByEmployee.mockResolvedValue(
        1,
      );

      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.assign(assignAssetDto)).rejects.toThrow(
        'Funcionário já possui um notebook atribuído',
      );

      expect(repository.countNotebooksByEmployee).toHaveBeenCalledWith(
        assignAssetDto.employeeId,
      );
      expect(repository.assign).not.toHaveBeenCalled();
    });

    it('should allow assigning notebook if employee has none', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(null);
      mockAssetAssignmentsRepository.countNotebooksByEmployee.mockResolvedValue(
        0,
      );
      mockAssetAssignmentsRepository.assign.mockResolvedValue(mockAssignment);
      mockAssetsService.update.mockResolvedValue({
        ...mockNotebook,
        status: AssetStatus.EM_USO,
      });

      const result = await service.assign(assignAssetDto);

      expect(repository.countNotebooksByEmployee).toHaveBeenCalledWith(
        assignAssetDto.employeeId,
      );
      expect(repository.assign).toHaveBeenCalled();
      expect(result).toEqual(mockAssignment);
    });

    it('should allow assigning multiple non-notebook assets to same employee', async () => {
      const assignMouseDto: AssignAssetDto = {
        assetId: mockMouse.id,
        employeeId: mockEmployee.id,
      };

      const mouseAssignment: AssetEmployee = {
        ...mockAssignment,
        id: 'mouse-assignment-uuid',
        assetId: mockMouse.id,
      };

      mockAssetsService.findOne.mockResolvedValue(mockMouse);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(null);
      mockAssetAssignmentsRepository.assign.mockResolvedValue(mouseAssignment);
      mockAssetsService.update.mockResolvedValue({
        ...mockMouse,
        status: AssetStatus.EM_USO,
      });

      const result = await service.assign(assignMouseDto);

      expect(repository.countNotebooksByEmployee).not.toHaveBeenCalled();
      expect(repository.assign).toHaveBeenCalledWith(
        assignMouseDto.assetId,
        assignMouseDto.employeeId,
      );
      expect(result).toEqual(mouseAssignment);
    });

    it('should update asset status to EM_USO after assignment', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockMouse);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(null);
      mockAssetAssignmentsRepository.assign.mockResolvedValue(mockAssignment);
      mockAssetsService.update.mockResolvedValue({
        ...mockMouse,
        status: AssetStatus.EM_USO,
      });

      await service.assign({
        assetId: mockMouse.id,
        employeeId: mockEmployee.id,
      });

      expect(assetsService.update).toHaveBeenCalledWith(mockMouse.id, {
        status: AssetStatus.EM_USO,
      });
    });
  });

  describe('unassign', () => {
    const unassignAssetDto: UnassignAssetDto = {
      assetId: mockNotebook.id,
      employeeId: mockEmployee.id,
    };

    it('should unassign asset from employee successfully', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(
        mockAssignment,
      );
      mockAssetAssignmentsRepository.unassign.mockResolvedValue(mockAssignment);
      mockAssetsService.update.mockResolvedValue({
        ...mockNotebook,
        status: AssetStatus.DISPONIVEL,
      });

      const result = await service.unassign(unassignAssetDto);

      expect(assetsService.findOne).toHaveBeenCalledWith(
        unassignAssetDto.assetId,
      );
      expect(employeesService.findOne).toHaveBeenCalledWith(
        unassignAssetDto.employeeId,
      );
      expect(repository.findAssignment).toHaveBeenCalledWith(
        unassignAssetDto.assetId,
        unassignAssetDto.employeeId,
      );
      expect(repository.unassign).toHaveBeenCalledWith(
        unassignAssetDto.assetId,
        unassignAssetDto.employeeId,
      );
      expect(assetsService.update).toHaveBeenCalledWith(
        unassignAssetDto.assetId,
        {
          status: AssetStatus.DISPONIVEL,
        },
      );
      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      mockAssetsService.findOne.mockRejectedValue(
        new NotFoundException('Ativo não encontrado'),
      );

      await expect(service.unassign(unassignAssetDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(assetsService.findOne).toHaveBeenCalledWith(
        unassignAssetDto.assetId,
      );
      expect(repository.unassign).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockRejectedValue(
        new NotFoundException('Funcionário não encontrado'),
      );

      await expect(service.unassign(unassignAssetDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(employeesService.findOne).toHaveBeenCalledWith(
        unassignAssetDto.employeeId,
      );
      expect(repository.unassign).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if assignment does not exist', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(null);

      await expect(service.unassign(unassignAssetDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.unassign(unassignAssetDto)).rejects.toThrow(
        'Atribuição não encontrada',
      );

      expect(repository.findAssignment).toHaveBeenCalledWith(
        unassignAssetDto.assetId,
        unassignAssetDto.employeeId,
      );
      expect(repository.unassign).not.toHaveBeenCalled();
    });

    it('should update asset status to DISPONIVEL after unassignment', async () => {
      mockAssetsService.findOne.mockResolvedValue(mockNotebook);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssignment.mockResolvedValue(
        mockAssignment,
      );
      mockAssetAssignmentsRepository.unassign.mockResolvedValue(mockAssignment);
      mockAssetsService.update.mockResolvedValue({
        ...mockNotebook,
        status: AssetStatus.DISPONIVEL,
      });

      await service.unassign(unassignAssetDto);

      expect(assetsService.update).toHaveBeenCalledWith(
        unassignAssetDto.assetId,
        {
          status: AssetStatus.DISPONIVEL,
        },
      );
    });
  });

  describe('findAssetsByEmployee', () => {
    it('should return assets assigned to employee', async () => {
      const mockAssets: Asset[] = [mockNotebook, mockMouse];

      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssetsByEmployee.mockResolvedValue(
        mockAssets,
      );

      const result = await service.findAssetsByEmployee(mockEmployee.id);

      expect(employeesService.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findAssetsByEmployee).toHaveBeenCalledWith(
        mockEmployee.id,
      );
      expect(result).toEqual(mockAssets);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if employee has no assets', async () => {
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockAssetAssignmentsRepository.findAssetsByEmployee.mockResolvedValue([]);

      const result = await service.findAssetsByEmployee(mockEmployee.id);

      expect(employeesService.findOne).toHaveBeenCalledWith(mockEmployee.id);
      expect(repository.findAssetsByEmployee).toHaveBeenCalledWith(
        mockEmployee.id,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      mockEmployeesService.findOne.mockRejectedValue(
        new NotFoundException('Funcionário não encontrado'),
      );

      await expect(
        service.findAssetsByEmployee('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findAssetsByEmployee('non-existent-id'),
      ).rejects.toThrow('Funcionário não encontrado');

      expect(employeesService.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.findAssetsByEmployee).not.toHaveBeenCalled();
    });
  });
});
