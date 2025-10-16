export interface Company {
  id: string;
  name: string;
  cnpj: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  cnpj: string;
}

export interface UpdateCompanyDto {
  name?: string;
  cnpj?: string;
}
