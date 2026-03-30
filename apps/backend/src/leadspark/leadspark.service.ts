import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';

export interface LeadSparkSyncResult {
  synced: number;
  errors: { productId: string; name: string; message: string }[];
}

@Injectable()
export class LeadSparkService {
  private readonly logger = new Logger(LeadSparkService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private get baseUrl(): string {
    const projectRef = this.configService.get<string>('LEADSPARK_PROJECT_REF');
    return `https://${projectRef}.supabase.co/functions/v1/external-products`;
  }

  private get apiKey(): string {
    return this.configService.get<string>('LEADSPARK_API_KEY') ?? '';
  }

  private get organizationId(): string {
    return this.configService.get<string>('LEADSPARK_ORGANIZATION_ID') ?? '';
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };
  }

  /** Map a local product to the LeadSpark payload */
  private toLeadSparkPayload(product: ProductDocument) {
    const category =
      product.category && typeof product.category === 'object' && 'name' in product.category
        ? (product.category as any).name
        : undefined;

    return {
      organization_id: this.organizationId,
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      sku: product.sku,
      description: product.description,
      category,
      status: product.isOutOfStock ? 'discontinued' : 'active',
    };
  }

  /** Upsert a single product: try PATCH first, fall back to POST on 404 */
  private async upsertProduct(product: ProductDocument): Promise<void> {
    const id = product._id.toString();
    const payload = this.toLeadSparkPayload(product);

    // Try PATCH first
    const patchRes = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });

    if (patchRes.ok) return;

    if (patchRes.status === 404) {
      // Product doesn't exist yet — create it
      const postRes = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(payload),
      });

      if (!postRes.ok && postRes.status !== 409) {
        const body = await postRes.text();
        throw new Error(`POST failed (${postRes.status}): ${body}`);
      }
      return;
    }

    const body = await patchRes.text();
    throw new Error(`PATCH failed (${patchRes.status}): ${body}`);
  }

  /** Sync all local products to LeadSpark AI */
  async syncAllProducts(): Promise<LeadSparkSyncResult> {
    const products = await this.productModel.find().exec();
    const errors: LeadSparkSyncResult['errors'] = [];
    let synced = 0;

    for (const product of products) {
      try {
        await this.upsertProduct(product);
        synced++;
      } catch (err: any) {
        this.logger.error(`Failed to sync product ${product._id}: ${err.message}`);
        errors.push({
          productId: product._id.toString(),
          name: product.name,
          message: err.message,
        });
      }
    }

    this.logger.log(`LeadSpark sync complete: ${synced} synced, ${errors.length} errors`);
    return { synced, errors };
  }
}
