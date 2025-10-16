import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetEmployee, Asset } from '@prisma/client';

@Injectable()
export class AssetAssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assign(assetId: string, employeeId: string): Promise<AssetEmployee> {
    return this.prisma.assetEmployee.create({
      data: {
        assetId,
        employeeId,
      },
    });
  }

  async unassign(assetId: string, employeeId: string): Promise<AssetEmployee> {
    return this.prisma.assetEmployee.delete({
      where: {
        assetId_employeeId: {
          assetId,
          employeeId,
        },
      },
    });
  }

  async findAssignment(
    assetId: string,
    employeeId: string,
  ): Promise<AssetEmployee | null> {
    return this.prisma.assetEmployee.findUnique({
      where: {
        assetId_employeeId: {
          assetId,
          employeeId,
        },
      },
    });
  }

  async findAssetsByEmployee(employeeId: string): Promise<Asset[]> {
    const assignments = await this.prisma.assetEmployee.findMany({
      where: { employeeId },
      include: {
        asset: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return assignments.map((assignment) => assignment.asset);
  }

  async countNotebooksByEmployee(employeeId: string): Promise<number> {
    return this.prisma.assetEmployee.count({
      where: {
        employeeId,
        asset: {
          type: {
            contains: 'Notebook',
            mode: 'insensitive',
          },
        },
      },
    });
  }
}
