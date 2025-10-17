import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset, AssetStatus } from '@prisma/client';

@Injectable()
export class AssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.prisma.asset.create({
      data: createAssetDto,
    });
  }

  async findAll(): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      include: {
        employees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Asset | null> {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        employees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findByStatus(status: AssetStatus): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      where: { status },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  async remove(id: string): Promise<Asset> {
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
