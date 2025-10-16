export interface Employee {
  id: string;
  name: string;
  email: string;
  cpf: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    cnpj: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  cpf: string;
  companyId: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  cpf?: string;
  companyId?: string;
}
