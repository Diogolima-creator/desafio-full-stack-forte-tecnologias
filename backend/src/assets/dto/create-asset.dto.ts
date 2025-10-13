import { IsNotEmpty, IsString, IsEnum, IsOptional, Length } from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @IsNotEmpty({ message: 'O nome do ativo é obrigatório' })
  @IsString({ message: 'O nome deve ser um texto' })
  @Length(2, 100, { message: 'O nome deve ter entre 2 e 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'O tipo do ativo é obrigatório' })
  @IsString({ message: 'O tipo deve ser um texto' })
  @Length(2, 50, { message: 'O tipo deve ter entre 2 e 50 caracteres' })
  type: string;

  @IsOptional()
  @IsEnum(AssetStatus, {
    message: 'O status deve ser: DISPONIVEL, EM_USO ou EM_MANUTENCAO',
  })
  status?: AssetStatus;
}
