import { z } from 'zod';
import { CmsPageType, CmsPageStatus } from '@prisma/client';
import { paginationSchema } from '../../middleware/validate';

export const cmsQuerySchema = paginationSchema.extend({
  type: z.nativeEnum(CmsPageType).optional(),
  status: z.nativeEnum(CmsPageStatus).optional(),
});

export const createPageSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(300),
  type: z.nativeEnum(CmsPageType),
  status: z.nativeEnum(CmsPageStatus).default(CmsPageStatus.DRAFT),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(500).optional(),
});

export const updatePageSchema = createPageSchema.partial().extend({
  changeLog: z.string().max(500).optional(),
});

export type CmsQueryInput = z.infer<typeof cmsQuerySchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
