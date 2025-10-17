export enum AssetStatus {
  DISPONIVEL = 'DISPONIVEL',
  EM_USO = 'EM_USO',
  EM_MANUTENCAO = 'EM_MANUTENCAO'
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: AssetStatus;
  employees?: AssetAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  assignedAt: string;
  employee?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateAssetDto {
  name: string;
  type: string;
  status?: AssetStatus;
}

export interface UpdateAssetDto {
  name?: string;
  type?: string;
  status?: AssetStatus;
}
