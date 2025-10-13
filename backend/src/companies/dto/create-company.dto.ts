import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório' })
  @IsString({ message: 'O nome deve ser um texto' })
  @Length(2, 100, { message: 'O nome deve ter entre 2 e 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'O CNPJ é obrigatório' })
  @IsString({ message: 'O CNPJ deve ser um texto' })
  @Matches(/^\d{14}$/, {
    message: 'O CNPJ deve conter exatamente 14 dígitos numéricos',
  })
  cnpj: string;
}
