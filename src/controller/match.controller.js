import {ApiError} from "../utilities/ApiError.js";
import {asyncHandler} from "../utilities/asynchandler.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {createMatchSchema} from "../validation/matches.js";
import {db} from "../db/index.js";
import {matches} from "../db/schema.js";
import {getMatchStatus} from "../utilities/match-status.js";
import {desc} from "drizzle-orm";

const  createMatch = asyncHandler(async (req, res) => {
    const zodParsed = createMatchSchema.safeParse(req.body);
    if (!zodParsed.success) {
        throw new ApiError("Invalid request body " + JSON.stringify(zodParsed.error) , 400);
    }
    const {data } = zodParsed;
    if(!data) throw new ApiError("data in zod is miissing" , 400);
    const {startTime , endTime ,homeScore , awayScore }= data;
    // if(!startTime || !endTime || !homeScore  || !awayScore) throw new ApiError("startTime and endTime are required" , 400);

    const [event] = await db.insert(matches).values({
        ...zodParsed.data,
        startTime: new Date(zodParsed.data.startTime),
        endTime: new Date(zodParsed.data.endTime),
        homeScore: homeScore || 0,
        awayScore: awayScore || 0,
        status: getMatchStatus(startTime , endTime)
    }).returning();

    if(!event) throw new ApiError("Failed to create match" , 500);
    if(res.app.locals.broadcastMatchesCreated) {
        console.log("i am here")
        res.app.locals.broadcastMatchesCreated(event)
    }

    res.status(201).json(new ApiResponse(201 , event , "match created successfully"));

})

const getMatches = asyncHandler(async (req, res) => {


        const allMatches = await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(100);
        if(!allMatches ) throw new ApiError("Failed to fetch matches" , 500);
        if(allMatches.length === 0) throw new ApiError("No matches found" , 404);

        res.status(200).json(new ApiResponse(200 , allMatches , "matches fetched successfully"));
})


export {
    createMatch,
    getMatches

}