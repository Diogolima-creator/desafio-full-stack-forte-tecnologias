import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssetsService } from '../../../src/assets/assets.service';
import { AssetsRepository } from '../../../src/assets/assets.repository';
import { CreateAssetDto } from '../../../src/assets/dto/create-asset.dto';
import { UpdateAssetDto } from '../../../src/assets/dto/update-asset.dto';
import { Asset, AssetStatus } from '@prisma/client';

describe('AssetsService', () => {
  let service: AssetsService;
  let repository: AssetsRepository;

  const mockAsset: Asset = {
    id: 'asset-uuid-123',
    name: 'Dell Notebook Latitude 5420',
    type: 'Notebook',
    status: AssetStatus.DISPONIVEL,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockAssetsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByStatus: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: AssetsRepository,
          useValue: mockAssetsRepository,
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    repository = module.get<AssetsRepository>(AssetsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAssetDto: CreateAssetDto = {
      name: 'Dell Notebook Latitude 5420',
      type: 'Notebook',
    };

    it('should create an asset successfully with default status', async () => {
      mockAssetsRepository.create.mockResolvedValue(mockAsset);

      const result = await service.create(createAssetDto);

      expect(repository.create).toHaveBeenCalledWith(createAssetDto);
      expect(result).toEqual(mockAsset);
      expect(result.status).toBe(AssetStatus.DISPONIVEL);
    });

    it('should create an asset with specified status', async () => {
      const createWithStatus: CreateAssetDto = {
        ...createAssetDto,
        status: AssetStatus.EM_MANUTENCAO,
      };

      const assetInMaintenance = {
        ...mockAsset,
        status: AssetStatus.EM_MANUTENCAO,
      };

      mockAssetsRepository.create.mockResolvedValue(assetInMaintenance);

      const result = await service.create(createWithStatus);

      expect(repository.create).toHaveBeenCalledWith(createWithStatus);
      expect(result).toEqual(assetInMaintenance);
      expect(result.status).toBe(AssetStatus.EM_MANUTENCAO);
    });

    it('should create an asset with status EM_USO', async () => {
      const createWithInUse: CreateAssetDto = {
        ...createAssetDto,
        status: AssetStatus.EM_USO,
      };

      const assetInUse = {
        ...mockAsset,
        status: AssetStatus.EM_USO,
      };

      mockAssetsRepository.create.mockResolvedValue(assetInUse);

      const result = await service.create(createWithInUse);

      expect(repository.create).toHaveBeenCalledWith(createWithInUse);
      expect(result).toEqual(assetInUse);
      expect(result.status).toBe(AssetStatus.EM_USO);
    });
  });

  describe('findAll', () => {
    it('should return an array of assets', async () => {
      const mockAssets: Asset[] = [
        mockAsset,
        {
          ...mockAsset,
          id: 'asset-uuid-456',
          name: 'Logitech Mouse MX Master 3',
          type: 'Mouse',
        },
        {
          ...mockAsset,
          id: 'asset-uuid-789',
          name: 'Dell Monitor 27 inch',
          type: 'Monitor',
          status: AssetStatus.EM_MANUTENCAO,
        },
      ];

      mockAssetsRepository.findAll.mockResolvedValue(mockAssets);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAssets);
      expect(result).toHaveLength(3);
    });

    it('should return an empty array if no assets exist', async () => {
      mockAssetsRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return an asset by id', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);

      const result = await service.findOne(mockAsset.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(result).toEqual(mockAsset);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Ativo não encontrado',
      );

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('findByStatus', () => {
    it('should return available assets', async () => {
      const availableAssets: Asset[] = [
        mockAsset,
        {
          ...mockAsset,
          id: 'asset-uuid-456',
          name: 'Logitech Mouse',
          type: 'Mouse',
        },
      ];

      mockAssetsRepository.findByStatus.mockResolvedValue(availableAssets);

      const result = await service.findByStatus(AssetStatus.DISPONIVEL);

      expect(repository.findByStatus).toHaveBeenCalledWith(
        AssetStatus.DISPONIVEL,
      );
      expect(result).toEqual(availableAssets);
      expect(result).toHaveLength(2);
      expect(result.every((asset) => asset.status === AssetStatus.DISPONIVEL)).toBe(true);
    });

    it('should return assets in use', async () => {
      const assetsInUse: Asset[] = [
        {
          ...mockAsset,
          id: 'asset-uuid-100',
          status: AssetStatus.EM_USO,
        },
      ];

      mockAssetsRepository.findByStatus.mockResolvedValue(assetsInUse);

      const result = await service.findByStatus(AssetStatus.EM_USO);

      expect(repository.findByStatus).toHaveBeenCalledWith(AssetStatus.EM_USO);
      expect(result).toEqual(assetsInUse);
      expect(result.every((asset) => asset.status === AssetStatus.EM_USO)).toBe(true);
    });

    it('should return assets in maintenance', async () => {
      const assetsInMaintenance: Asset[] = [
        {
          ...mockAsset,
          id: 'asset-uuid-200',
          status: AssetStatus.EM_MANUTENCAO,
        },
        {
          ...mockAsset,
          id: 'asset-uuid-201',
          name: 'Broken Monitor',
          type: 'Monitor',
          status: AssetStatus.EM_MANUTENCAO,
        },
      ];

      mockAssetsRepository.findByStatus.mockResolvedValue(assetsInMaintenance);

      const result = await service.findByStatus(AssetStatus.EM_MANUTENCAO);

      expect(repository.findByStatus).toHaveBeenCalledWith(
        AssetStatus.EM_MANUTENCAO,
      );
      expect(result).toEqual(assetsInMaintenance);
      expect(result).toHaveLength(2);
      expect(result.every((asset) => asset.status === AssetStatus.EM_MANUTENCAO)).toBe(true);
    });

    it('should return empty array if no assets match status', async () => {
      mockAssetsRepository.findByStatus.mockResolvedValue([]);

      const result = await service.findByStatus(AssetStatus.EM_USO);

      expect(repository.findByStatus).toHaveBeenCalledWith(AssetStatus.EM_USO);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    const updateAssetDto: UpdateAssetDto = {
      name: 'Dell Notebook Latitude 5420 Updated',
    };

    it('should update an asset successfully', async () => {
      const updatedAsset = { ...mockAsset, ...updateAssetDto };

      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetsRepository.update.mockResolvedValue(updatedAsset);

      const result = await service.update(mockAsset.id, updateAssetDto);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(repository.update).toHaveBeenCalledWith(
        mockAsset.id,
        updateAssetDto,
      );
      expect(result).toEqual(updatedAsset);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateAssetDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent-id', updateAssetDto),
      ).rejects.toThrow('Ativo não encontrado');

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update asset status to EM_MANUTENCAO', async () => {
      const updateStatus: UpdateAssetDto = {
        status: AssetStatus.EM_MANUTENCAO,
      };

      const updatedAsset = { ...mockAsset, status: AssetStatus.EM_MANUTENCAO };

      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetsRepository.update.mockResolvedValue(updatedAsset);

      const result = await service.update(mockAsset.id, updateStatus);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(repository.update).toHaveBeenCalledWith(mockAsset.id, updateStatus);
      expect(result).toEqual(updatedAsset);
      expect(result.status).toBe(AssetStatus.EM_MANUTENCAO);
    });

    it('should update asset status to EM_USO', async () => {
      const updateStatus: UpdateAssetDto = {
        status: AssetStatus.EM_USO,
      };

      const updatedAsset = { ...mockAsset, status: AssetStatus.EM_USO };

      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetsRepository.update.mockResolvedValue(updatedAsset);

      const result = await service.update(mockAsset.id, updateStatus);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(repository.update).toHaveBeenCalledWith(mockAsset.id, updateStatus);
      expect(result).toEqual(updatedAsset);
      expect(result.status).toBe(AssetStatus.EM_USO);
    });

    it('should update asset status back to DISPONIVEL', async () => {
      const assetInUse = { ...mockAsset, status: AssetStatus.EM_USO };
      const updateStatus: UpdateAssetDto = {
        status: AssetStatus.DISPONIVEL,
      };

      const updatedAsset = { ...mockAsset, status: AssetStatus.DISPONIVEL };

      mockAssetsRepository.findOne.mockResolvedValue(assetInUse);
      mockAssetsRepository.update.mockResolvedValue(updatedAsset);

      const result = await service.update(mockAsset.id, updateStatus);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(repository.update).toHaveBeenCalledWith(mockAsset.id, updateStatus);
      expect(result).toEqual(updatedAsset);
      expect(result.status).toBe(AssetStatus.DISPONIVEL);
    });

    it('should update asset type', async () => {
      const updateType: UpdateAssetDto = {
        type: 'Notebook Premium',
      };

      const updatedAsset = { ...mockAsset, type: 'Notebook Premium' };

      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetsRepository.update.mockResolvedValue(updatedAsset);

      const result = await service.update(mockAsset.id, updateType);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(repository.update).toHaveBeenCalledWith(mockAsset.id, updateType);
      expect(result).toEqual(updatedAsset);
      expect(result.type).toBe('Notebook Premium');
    });

    it('should update multiple fields at once', async () => {
      const updateMultiple: UpdateAssetDto = {
        name: 'Updated Name',
        type: 'Updated Type',
        status: AssetStatus.EM_MANUTENCAO,
      };

      const updatedAsset = { ...mockAsset, ...updateMultiple };

      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetsRepository.update.mockResolvedValue(updatedAsset);

      const result = await service.update(mockAsset.id, updateMultiple);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(repository.update).toHaveBeenCalledWith(
        mockAsset.id,
        updateMultiple,
      );
      expect(result).toEqual(updatedAsset);
      expect(result.name).toBe('Updated Name');
      expect(result.type).toBe('Updated Type');
      expect(result.status).toBe(AssetStatus.EM_MANUTENCAO);
    });
  });

  describe('remove', () => {
    it('should remove an asset successfully', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetsRepository.remove.mockResolvedValue(mockAsset);

      const result = await service.remove(mockAsset.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockAsset.id);
      expect(repository.remove).toHaveBeenCalledWith(mockAsset.id);
      expect(result).toEqual(mockAsset);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Ativo não encontrado',
      );

      expect(repository.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('should remove an asset regardless of its status', async () => {
      const assetInUse = { ...mockAsset, status: AssetStatus.EM_USO };

      mockAssetsRepository.findOne.mockResolvedValue(assetInUse);
      mockAssetsRepository.remove.mockResolvedValue(assetInUse);

      const result = await service.remove(assetInUse.id);

      expect(repository.findOne).toHaveBeenCalledWith(assetInUse.id);
      expect(repository.remove).toHaveBeenCalledWith(assetInUse.id);
      expect(result).toEqual(assetInUse);
    });
  });
});
