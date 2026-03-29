import { ApiError } from '../utilities/ApiError.js';
import { asyncHandler } from '../utilities/asynchandler.js';
import { ApiResponse } from '../utilities/ApiResponse.js';

import { matchIdParamSchema } from '../validation/matches.js';
import { createCommentarySchema } from '../validation/commentary.js';
import { listCommentaryQuerySchema } from '../validation/commentary.js';

import { db } from '../db/index.js';
import { commentary } from '../db/schema.js';
import { asc, eq } from 'drizzle-orm';

export const createCommentary = asyncHandler(async (req, res) => {








	const  {  matchId } = req?.params
	const id = parseInt(matchId)



	if (!matchId || Number.isNaN(id)) {
		throw new ApiError('matchId is required in route params', 400);
	}
	const {
		minute,
		sequence,
		period,
		eventType,
		actor,
		team,
		message,
		metadata,
		tags,
	} = req?.body



	if (minute === undefined || minute === null || Number.isNaN(Number(minute))) {
		throw new ApiError('minute is required', 400);
	}
	if (!message) {
		throw new ApiError('message is required', 400);
	}

	const [created] = await db
	  .insert(commentary)
	  .values({
		matchId:id,
		minute,
		sequence: sequence ?? 0,
		period,
		eventType: eventType ?? 'comment',
		actor,
		team,
		message,
		metadata,
		tags,
	  })
	  .returning();

	if (!created) {
	  throw new ApiError('Failed to create commentary', 500);
	}
	if(res.app.locals.broadcastCommentary) res.app.locals.broadcastCommentary(created.matchId , created)

	return res
	  .status(201)
	  .json(new ApiResponse(201, created, 'commentary created successfully'));
 
});

export const getCommentaryByMatchId = asyncHandler(async (req, res) => {

	const paramsParsed = matchIdParamSchema.safeParse(req.params);
	if (!paramsParsed.success) {
	  throw new ApiError(
		`Invalid route params: ${paramsParsed.error.message}`,
		400,
	  );
	}

	const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
	if (!queryParsed.success) {
	  throw new ApiError(
		`Invalid query params: ${queryParsed.error.message}`,
		400,
	  );
	}

	const matchId = paramsParsed.data.id;
	const limit = queryParsed.data.limit ?? 100;

	const rows = await db
	  .select()
	  .from(commentary)
	  .where(eq(commentary.matchId, matchId))
	  .orderBy(asc(commentary.minute), asc(commentary.sequence), asc(commentary.createdAt))
	  .limit(limit);

	return res
	  .status(200)
	  .json(new ApiResponse(200, rows, 'commentary fetched successfully'));
  
});





