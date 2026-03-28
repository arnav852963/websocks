import {Router} from "express";
import {createMatch, getMatches} from "../controller/match.controller.js";

const matchRoutes = Router()

matchRoutes.route("/createMatch").post(createMatch)
matchRoutes.route("/getMatches").get(getMatches)

export default matchRoutes;