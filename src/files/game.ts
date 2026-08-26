import * as express from 'express'
import { Client, Util, Handler } from '../libs'
const router = express.Router();

let game = router;
export { game }

const libs = new Client.Client

/* NONE TOKEN APIS */

// Legacy 8.0.x clients use both root and nested spellings. Keep every
// handshake endpoint available, including GET fallbacks used by some
// old builds.
const completeEmpty = (_req: express.Request, _res: express.Response) =>
    Util.sendPacket(_res, {}, 200, "COMPLETE");

router.get("/versionCombo.ds", completeEmpty);
router.get("/check/serverTime.ds", Handler.asyncHandler(libs.ApiClient.getServerTime));
router.get("/check/clientLog.ds", completeEmpty);
router.get("/check/configCheck.ds", Handler.asyncHandler(libs.ApiClient.configCheck));
router.get("/notice/notices.ds", async (_req: express.Request, res: express.Response) => {
    const returnData = await Util.getAsset("data/notices/notices");
    Util.sendPacket(res, returnData, 200, "COMPLETE");
});
router.get("/notices.ds", async (_req: express.Request, res: express.Response) => {
    const returnData = await Util.getAsset("data/notices/notices");
    Util.sendPacket(res, returnData, 200, "COMPLETE");
});
router.get("/serverTime.ds", Handler.asyncHandler(libs.ApiClient.getServerTime));
router.get("/configCheck.ds", Handler.asyncHandler(libs.ApiClient.configCheck));
router.get("/clientLog.ds", completeEmpty);


router.post("/check/serverTime.ds", Handler.asyncHandler(libs.ApiClient.getServerTime)) /** Check Server Time Api */

router.post("/versionCombo.ds", Handler.asyncHandler(libs.ApiClient.getVersionCombo)) /** Check Client Update Api */

router.post("/check/clientLog.ds", Handler.asyncHandler(libs.ApiClient.getClientLog)) /** Check Client Api */

router.post("/check/configCheck.ds", Handler.asyncHandler(libs.ApiClient.configCheck)) /** Check Config Api */

const sendNotices = async (_req : express.Request, res : express.Response) => {
    const returnData = await Util.getAsset("data/notices/notices");
    Util.sendPacket(res, returnData, 200, "COMPLETE");
};
router.post("/notice/notices.ds", sendNotices);
router.post("/notices.ds", sendNotices);


/* WITH TOKEN APIS */

router.post("/member/getLeaguePlace.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getLeaguePlace)) /** 리그에서 등수 가져오기 */

router.post("/game/getFriendComboInfo2.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getFriendComoboInfo)) /** 친구들 콤보 */

router.post("/member/episodeWeeklyRank.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getEpisodeWeeklyRank)) /** 주간 랭킹 가져오기 */

router.post("/member/getLeagueResult.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getLeagueResult)) /** 리그결과 가져오기 */

router.post("/member/setNickname.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.changeNickname)) /** 닉네임 설정 */

router.post("/member/logout.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.logout)) /** 로그아웃 */

router.post("/member/getEpisodeLeagueMemberInfo.ds" ,libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getEpisodeLeagueMemberInfo)) /** 에피소드 멤버 정보 */

router.post("/shop/buyStuff.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.buyStuff)) /** 아이템 구매 */

router.post("/member/initMember3.ds" ,libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getInitData)) /** 멤버 데이터 처리 */
router.post("/member/episodeDefaultMemberInfo.ds" ,libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getInitData)) 

router.post("/member/getEpisodeFriendInfo2.ds" ,libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.getEpisodeFriendInfo)) /** 멤버 데이터 처리 */

router.post("/push/setPushStatus.ds", libs.ApiClient.isVaildUser, Handler.asyncHandler(libs.ApiClient.setPushStatus))






