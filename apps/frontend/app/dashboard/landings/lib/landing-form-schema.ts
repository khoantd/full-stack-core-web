import * as z from 'zod';

const heroSchema = z.object({
  id: z.string(),
  type: z.literal('hero'),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  image: z.string().optional(),
  primaryCtaLabel: z.string().optional(),
  primaryCtaHref: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
});

const featuresSchema = z.object({
  id: z.string(),
  type: z.literal('features'),
  heading: z.string().min(1),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        icon: z.string().optional(),
      }),
    )
    .min(1),
});

const ctaSchema = z.object({
  id: z.string(),
  type: z.literal('cta'),
  title: z.string().min(1),
  body: z.string().optional(),
  buttonLabel: z.string().min(1),
  buttonHref: z.string().min(1),
});

const statsSchema = z.object({
  id: z.string(),
  type: z.literal('stats'),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .min(1),
});

const faqSchema = z.object({
  id: z.string(),
  type: z.literal('faq'),
  items: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(1),
});

const paragraphSchema = z.object({
  id: z.string(),
  type: z.literal('paragraph'),
  body: z.string().min(1),
});

const sectionSchema = z.discriminatedUnion('type', [
  heroSchema,
  featuresSchema,
  ctaSchema,
  statsSchema,
  faqSchema,
  paragraphSchema,
]);

export const landingFormSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['Draft', 'Published', 'Archived']),
  isDefault: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sections: z.array(sectionSchema),
});

export type LandingFormValues = z.infer<typeof landingFormSchema>;

export function newSectionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptySection(
  type: z.infer<typeof sectionSchema>['type'],
): z.infer<typeof sectionSchema> {
  const id = newSectionId();
  switch (type) {
    case 'hero':
      return { id, type: 'hero', headline: '' };
    case 'features':
      return { id, type: 'features', heading: '', items: [{ title: '' }] };
    case 'cta':
      return { id, type: 'cta', title: '', buttonLabel: '', buttonHref: '' };
    case 'stats':
      return { id, type: 'stats', items: [{ label: '', value: '' }] };
    case 'faq':
      return { id, type: 'faq', items: [{ question: '', answer: '' }] };
    case 'paragraph':
      return { id, type: 'paragraph', body: '' };
  }
}
