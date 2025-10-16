import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AssetAssignmentsRepository } from './asset-assignments.repository';
import { AssetsService } from '../assets/assets.service';
import { EmployeesService } from '../employees/employees.service';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { UnassignAssetDto } from './dto/unassign-asset.dto';
import { AssetEmployee, Asset, AssetStatus } from '@prisma/client';

@Injectable()
export class AssetAssignmentsService {
  constructor(
    private readonly assetAssignmentsRepository: AssetAssignmentsRepository,
    private readonly assetsService: AssetsService,
    private readonly employeesService: EmployeesService,
  ) {}

  async assign(assignAssetDto: AssignAssetDto): Promise<AssetEmployee> {
    const { assetId, employeeId } = assignAssetDto;

    const asset = await this.assetsService.findOne(assetId);

    await this.employeesService.findOne(employeeId);

    if (asset.status !== AssetStatus.DISPONIVEL) {
      throw new BadRequestException(
        `Ativo não está disponível. Status atual: ${asset.status}`,
      );
    }

    const existingAssignment =
      await this.assetAssignmentsRepository.findAssignment(assetId, employeeId);

    if (existingAssignment) {
      throw new ConflictException('Ativo já está atribuído a este funcionário');
    }

    if (asset.type.toLowerCase().includes('notebook')) {
      const notebookCount =
        await this.assetAssignmentsRepository.countNotebooksByEmployee(
          employeeId,
        );

      if (notebookCount >= 1) {
        throw new BadRequestException(
          'Funcionário já possui um notebook atribuído. Cada funcionário pode ter apenas um notebook.',
        );
      }
    }

    const assignment = await this.assetAssignmentsRepository.assign(
      assetId,
      employeeId,
    );

    await this.assetsService.update(assetId, { status: AssetStatus.EM_USO });

    return assignment;
  }

  async unassign(unassignAssetDto: UnassignAssetDto): Promise<AssetEmployee> {
    const { assetId, employeeId } = unassignAssetDto;

    await this.assetsService.findOne(assetId);

    await this.employeesService.findOne(employeeId);

    const assignment =
      await this.assetAssignmentsRepository.findAssignment(assetId, employeeId);

    if (!assignment) {
      throw new NotFoundException(
        'Atribuição não encontrada. Ativo não está atribuído a este funcionário.',
      );
    }

    const removedAssignment =
      await this.assetAssignmentsRepository.unassign(assetId, employeeId);

    await this.assetsService.update(assetId, {
      status: AssetStatus.DISPONIVEL,
    });

    return removedAssignment;
  }

  async findAssetsByEmployee(employeeId: string): Promise<Asset[]> {
    await this.employeesService.findOne(employeeId);

    return this.assetAssignmentsRepository.findAssetsByEmployee(employeeId);
  }
}
