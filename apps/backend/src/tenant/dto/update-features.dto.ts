import { IsArray, IsIn } from 'class-validator';
import { ALL_FEATURES, FeatureKey } from '../schemas/tenant.schema';

export class UpdateFeaturesDto {
  @IsArray()
  @IsIn([...ALL_FEATURES], { each: true })
  enabledFeatures: FeatureKey[];
}
