import { Module } from '@nestjs/common';
import { AssetAssignmentsService } from './asset-assignments.service';
import { AssetAssignmentsController } from './asset-assignments.controller';
import { AssetAssignmentsRepository } from './asset-assignments.repository';
import { AssetsModule } from '../assets/assets.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [AssetsModule, EmployeesModule],
  controllers: [AssetAssignmentsController],
  providers: [AssetAssignmentsService, AssetAssignmentsRepository],
  exports: [AssetAssignmentsService],
})
export class AssetAssignmentsModule {}
