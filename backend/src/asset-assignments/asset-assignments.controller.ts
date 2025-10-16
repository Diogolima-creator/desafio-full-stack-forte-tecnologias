import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssetAssignmentsService } from './asset-assignments.service';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { UnassignAssetDto } from './dto/unassign-asset.dto';

@Controller('asset-assignments')
export class AssetAssignmentsController {
  constructor(
    private readonly assetAssignmentsService: AssetAssignmentsService,
  ) {}

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  assign(@Body() assignAssetDto: AssignAssetDto) {
    return this.assetAssignmentsService.assign(assignAssetDto);
  }

  @Delete('unassign')
  @HttpCode(HttpStatus.OK)
  unassign(@Body() unassignAssetDto: UnassignAssetDto) {
    return this.assetAssignmentsService.unassign(unassignAssetDto);
  }

  @Get('employee/:employeeId/assets')
  @HttpCode(HttpStatus.OK)
  findAssetsByEmployee(@Param('employeeId') employeeId: string) {
    return this.assetAssignmentsService.findAssetsByEmployee(employeeId);
  }
}
