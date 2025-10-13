import { IsNotEmpty, IsString, IsEmail, Length, Matches, IsUUID } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty({ message: 'O nome do funcionário é obrigatório' })
  @IsString({ message: 'O nome deve ser um texto' })
  @Length(2, 100, { message: 'O nome deve ter entre 2 e 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  @IsString({ message: 'O CPF deve ser um texto' })
  @Matches(/^\d{11}$/, { message: 'O CPF deve conter exatamente 11 dígitos numéricos' })
  cpf: string;

  @IsNotEmpty({ message: 'O ID da empresa é obrigatório' })
  @IsUUID('4', { message: 'O ID da empresa deve ser um UUID válido' })
  companyId: string;
}
