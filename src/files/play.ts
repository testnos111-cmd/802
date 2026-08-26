import * as express from 'express'
import { Client, Handler } from '../libs'
const router = express.Router();

let play = router;
export { play }

const libs = new Client.Client

/**
 * episode Game Before Play
 */
router.post("/game/episodeBeforePlay.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.episodeBeforePlay))

/**
 * episode Game After Play
 */
router.post("/game/episodeAfterPlay.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.episodeAfterPlay));

