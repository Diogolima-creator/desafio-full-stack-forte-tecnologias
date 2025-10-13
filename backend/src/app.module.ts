import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [PrismaModule, CompaniesModule, EmployeesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
