import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate<T>(schema: ZodSchema<T>, target: ValidateTarget = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const fieldErrors = formatZodErrors(result.error);
      next(new ValidationError(fieldErrors));
      return;
    }

    // Replace with parsed (coerced/transformed) data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
}

// Common reusable schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  q: z.string().max(200).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});
