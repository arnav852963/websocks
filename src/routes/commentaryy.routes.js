import {Router} from "express";
import {createCommentary, getCommentaryByMatchId} from "../controller/commentary.controller.js";

const commentaryRoutes = Router()

commentaryRoutes.route("/createCommentary/:matchId").post(createCommentary)
commentaryRoutes.route("/getCommentaryByMatchId/:id/:limit").get(getCommentaryByMatchId)

export default commentaryRoutes;