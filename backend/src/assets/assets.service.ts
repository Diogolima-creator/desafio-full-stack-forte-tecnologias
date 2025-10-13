import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetsRepository } from './assets.repository';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset, AssetStatus } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private readonly assetsRepository: AssetsRepository) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.assetsRepository.create(createAssetDto);
  }

  async findAll(): Promise<Asset[]> {
    return this.assetsRepository.findAll();
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetsRepository.findOne(id);

    if (!asset) {
      throw new NotFoundException('Ativo não encontrado');
    }

    return asset;
  }

  async findByStatus(status: AssetStatus): Promise<Asset[]> {
    return this.assetsRepository.findByStatus(status);
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    await this.findOne(id);

    return this.assetsRepository.update(id, updateAssetDto);
  }

  async remove(id: string): Promise<Asset> {
    await this.findOne(id);

    return this.assetsRepository.remove(id);
  }
}
