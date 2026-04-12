import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type Translations } from '../../common/i18n/translations';

export enum LandingPageStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

/** Discriminated section payloads stored as plain objects (validated in service). */
export type LandingSection =
  | {
      id: string;
      type: 'hero';
      headline: string;
      subheadline?: string;
      image?: string;
      primaryCtaLabel?: string;
      primaryCtaHref?: string;
      secondaryCtaLabel?: string;
      secondaryCtaHref?: string;
    }
  | {
      id: string;
      type: 'features';
      heading: string;
      items: { title: string; description?: string; icon?: string }[];
    }
  | {
      id: string;
      type: 'cta';
      title: string;
      body?: string;
      buttonLabel: string;
      buttonHref: string;
    }
  | {
      id: string;
      type: 'stats';
      items: { label: string; value: string }[];
    }
  | {
      id: string;
      type: 'faq';
      items: { question: string; answer: string }[];
    }
  | {
      id: string;
      type: 'paragraph';
      body: string;
    };

export type LandingPageTranslatableFields = {
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  sections?: LandingSection[];
};

@Schema({ collection: 'landing_pages', timestamps: true })
export class LandingPage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: LandingPageStatus, default: LandingPageStatus.DRAFT })
  status: LandingPageStatus;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;

  @Prop({ type: [Object], default: [] })
  sections: LandingSection[];

  @Prop({ type: Object, default: undefined })
  translations?: Translations<LandingPageTranslatableFields>;

  createdAt: Date;
  updatedAt: Date;
}

export const LandingPageSchema = SchemaFactory.createForClass(LandingPage);
LandingPageSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
