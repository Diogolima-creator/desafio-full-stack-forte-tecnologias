import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignAssetDto {
  @IsNotEmpty({ message: 'O ID do ativo é obrigatório' })
  @IsUUID('4', { message: 'O ID do ativo deve ser um UUID válido' })
  assetId: string;

  @IsNotEmpty({ message: 'O ID do funcionário é obrigatório' })
  @IsUUID('4', { message: 'O ID do funcionário deve ser um UUID válido' })
  employeeId: string;
}
