import { z } from 'zod';

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const isoDateStringSchema = z
  .string()
  .refine(
    (value) => {
      const date = new Date(value);
      return Number.isFinite(date.getTime()) && date.toISOString() === value;
    },
    { message: 'Must be a valid ISO date string' },
  );

export const createMatchSchema = z
  .object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: isoDateStringSchema,
    endTime: isoDateStringSchema,
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startTime);
    const end = new Date(value.endTime);

    if (Number.isFinite(start.getTime()) && Number.isFinite(end.getTime())) {
      if (end.getTime() <= start.getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endTime'],
          message: 'endTime must be after startTime',
        });
      }
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});

