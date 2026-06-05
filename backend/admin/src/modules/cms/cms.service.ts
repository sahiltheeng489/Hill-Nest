import { prisma } from '../../config/database';
import { CmsPageStatus, AuditAction } from '@prisma/client';
import { parsePagination, parseSort, buildPaginationMeta } from '../../shared/pagination';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { Request } from 'express';

export async function listPages(query: Record<string, unknown>, req: Request) {
  const pagination = parsePagination(req);
  const sort = parseSort(req, ['createdAt', 'updatedAt', 'title', 'status'], 'updatedAt');
  const where: Record<string, unknown> = {};
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.q) where.title = { contains: query.q, mode: 'insensitive' };

  const [items, total] = await Promise.all([
    prisma.cmsPage.findMany({ where, orderBy: { [sort.field]: sort.direction }, skip: pagination.skip, take: pagination.limit, include: { _count: { select: { versions: true } } } }),
    prisma.cmsPage.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getPageById(id: string) {
  const page = await prisma.cmsPage.findUnique({ where: { id }, include: { versions: { orderBy: { version: 'desc' } } } });
  if (!page) throw new NotFoundError('CMS Page');
  return page;
}

export async function createPage(input: Record<string, unknown>, authorId: string) {
  const existing = await prisma.cmsPage.findUnique({ where: { slug: input.slug as string } });
  if (existing) throw new ConflictError(`A page with slug "${input.slug}" already exists`);

  const page = await prisma.cmsPage.create({
    data: { ...input as any, authorId, publishedAt: (input.status === 'PUBLISHED') ? new Date() : null },
  });

  await prisma.cmsPageVersion.create({
    data: { pageId: page.id, version: 1, title: page.title, content: page.content, savedBy: authorId, changeLog: 'Initial version' },
  });

  await writeAuditLog({ adminUserId: authorId, action: AuditAction.CREATE, resource: 'cms_page', resourceId: page.id, description: `Created CMS page: ${page.title}` });
  return page;
}

export async function updatePage(id: string, input: Record<string, unknown>, authorId: string) {
  const page = await prisma.cmsPage.findUnique({ where: { id }, include: { _count: { select: { versions: true } } } });
  if (!page) throw new NotFoundError('CMS Page');

  const updated = await prisma.cmsPage.update({ where: { id }, data: { ...input as any, updatedAt: new Date() } });

  await prisma.cmsPageVersion.create({
    data: {
      pageId: id,
      version: (page as any)._count.versions + 1,
      title: (input.title as string) ?? page.title,
      content: (input.content as string) ?? page.content,
      savedBy: authorId,
      changeLog: (input.changeLog as string) ?? 'Updated',
    },
  });

  await writeAuditLog({ adminUserId: authorId, action: AuditAction.UPDATE, resource: 'cms_page', resourceId: id, description: `Updated CMS page: ${page.title}` });
  return updated;
}

export async function publishPage(id: string, adminId: string) {
  return updatePage(id, { status: CmsPageStatus.PUBLISHED, publishedAt: new Date().toISOString() }, adminId);
}

export async function archivePage(id: string, adminId: string) {
  return updatePage(id, { status: CmsPageStatus.ARCHIVED }, adminId);
}
