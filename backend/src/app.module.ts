import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { EmployeesModule } from './employees/employees.module';
import { AssetsModule } from './assets/assets.module';
import { AssetAssignmentsModule } from './asset-assignments/asset-assignments.module';

@Module({
  imports: [
    PrismaModule,
    CompaniesModule,
    EmployeesModule,
    AssetsModule,
    AssetAssignmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
