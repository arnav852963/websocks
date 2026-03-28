import dotenv from "dotenv";
import { ApiError } from "./utilities/ApiError.js";
import arcjet, {detectBot, shield, slidingWindow} from "@arcjet/node";
dotenv.config({
    path: './.env'
})

const arcjetKey = process.env.ARCJET_KEY
const arcjetMode = process.env.ARCJET_ENV === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE'
if(!arcjetKey || !arcjetMode) throw new ApiError("ARCJET_KEY is not defined in .env file" , 500)


export const httpArcjet = arcjetKey ? arcjet({
    key: arcjetKey,
    rules:[
        shield({mode :  arcjetMode}),
        detectBot({mode: arcjetMode , allow: ['CATEGORY:SEARCH_ENGINE' , 'CATEGORY:PREVIEW']}),
        slidingWindow({mode: arcjetMode , interval : '10s' , max : 50})
    ]
}) : null


export const wsArcjet = arcjetKey ? arcjet({
    key: arcjetKey,
    rules:[
        shield({mode :  arcjetMode}),
        detectBot({mode: arcjetMode , allow: ['CATEGORY:SEARCH_ENGINE' , 'CATEGORY:PREVIEW']}),
        slidingWindow({mode: arcjetMode , interval : '5s' , max : 5})
    ]
}) : null

export function securityMiddleware(){

    return async (req , res , next) => {
        if(!httpArcjet) return next()
        try {
            const decision = await httpArcjet.protect(req)
            if(decision.isDenied()){
                if(decision.reason.isRateLimit()){
                    return res.
                        status(429)
                        .json(new Error("Too many requests. Please try again later."))
                }

                return res
                    .status(403)
                    .json(new Error("Request denied by Arcjet. Reason: " + decision.reason.toString()))





            }


            next()

        } catch (err) {
            console.log("Arcjet error: " + err.message)
            throw new ApiError("Arcjet error: " + err.message , 500)
        }
    }
}