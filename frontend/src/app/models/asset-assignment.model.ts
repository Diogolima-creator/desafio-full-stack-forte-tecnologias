import { Asset } from './asset.model';
import { Employee } from './employee.model';

export interface AssetEmployee {
  id: string;
  assetId: string;
  employeeId: string;
  asset?: Asset;
  employee?: Employee;
  assignedAt: string;
}

export interface AssignAssetDto {
  assetId: string;
  employeeId: string;
}

export interface UnassignAssetDto {
  assetId: string;
  employeeId: string;
}
