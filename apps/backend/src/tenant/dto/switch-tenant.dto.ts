import { IsMongoId } from 'class-validator';

export class SwitchTenantDto {
  @IsMongoId()
  tenantId: string;
}

