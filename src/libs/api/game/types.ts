type status = 200 | 309 | 500 

export enum cashTypeList {
  COIN = 1,
  GEM = 2,
  LIFE = 3
}

type cashType = cashTypeList.COIN | cashTypeList.GEM | cashTypeList.LIFE | any

export enum stuffTypeList {
  COOKIE = "C",
  PET = "P",
  TREASURE = "T",
  COIN = "I",
  LIFE = "L",
  KEY = "K",
  BOOST = "B",
  ABILITY_1 = "A1",
  ABILITY_2 = "A2",
  ABILITY_3 = "A3",
  TREASURE_SLOT_EXPANSION = "TS",
  DRAW_PET = "PG",
  DRAW_TREASURE = "TG"
}


export interface playerLevelData {
  lv : number,
  exp : number
}


export interface stuffData {
    activity_pointA: number, /** 코인으로 샀을때 선물 포인트 */
    activity_pointB: number, /** 캐시로 샀을때 선물 포인트 */
    bonus_qty: number,
    contentsVersion: number,
    group_seq: number,
    imageTag: string,
    item_id: string,
    mix_level: string,
    moneyTypeA: cashType,
    moneyTypeB: cashType,
    priceA: number, /** 일반 구매일때 가격 */
    priceB: number, /** 캐시 구매일떄 가격 */
    qty: number, /** 수량 */
    slotPriority: number,
    special_type: number,
    stuffStatus: number,
    stuffType: string,
    stuff_name: string,
    tag: number
}

export interface initMemberData {
    currentEpisodeSeq: number,
    episodePlayInfoList: Array<object>,
    episodeUserInfo: Array<object>,
    comebackRewardList: Array<object>,
    keyCount: number,
    keyRestoredTime: number,
    missionInfoList: Array<object>,
    missionRewardList: Array<object>,
    collectibleItemList: Array<object>,
    stuffList: Array<object>,
    currentScore: number,
    memberSeq: number,
    friendInviteCount: number,
    receiveKakaoMessage: number,
    reviewRewardFlag: number,
    lv: number,
    exp: number,
    lastUsedCharacterGroupSeq: number,
    lastUsedPetGroupSeq: number,
    pushStatus: number,
    noticePushStatus: number,
    lifePushStatus: number,
    winPushStatus: number,
    receiveFortunePushStatus: number,
    receiveWeeklyPushStatus: number,
    lastDailyRewardTimestamp: number,
    secondeReviewFlag: number,
    resultFreeMixedGashaInfoList: [],
    lifeCount: number,
    lifeRestoredTime: number,
    friendWinCount: number,
    receivedGiftCount: number,
    fbLikeRewardFlag: number,
    episodeFinishedQuestList: Array<object>,
    availableBuyKeyWithHeart: number,
    neverAgainGashaReward: Array<object>,
    purchasedPackageList: Array<object>,
    ovenStatusList: Array<object>,
    cashInfo: object,
    showMiniGame: number,
    eventPlanList: Array<object>,
    rewardMailList: Array<object>,
    presetList: Array<object>,
    buffList: Array<object>,
    attendanceTableType: "ORDINARY",
    attendanceRewardList: Array<object>,
    attendanceRewardCount: number,
    attendanceRewardEndDate: number,
    isReadyForLeague: boolean,
    nickname: string,
    comboName: null,
    comboExpireDt: number,
    timeMillis: number,
    formattedTime: string,
    nextResetTime: number,
    cashItemList: Array<object>,
    inventoryItemList: Array<object>,
    petList: Array<object>, //레거시
    characterList: Array<object>, //레거시
    normalQuestList: Array<number>,
    unlockEpisodeQuestList: Array<number>
}

export interface returnData {
  status : status
  message : string,
  data : object
}

export interface episodeRankData {
  episodeRankInfoList: Array<any>,
  friendWinCount : number,
  leagueResult : {
      episodeSeq : number
   },
   cashInfo: object,
}

export interface serverTime {
  timeMillis : number,
  formattedTime : string,
  nextResetTime : number,
  leagueEndDt: number,
  nextLeagueStartDt : number
}

export interface inventoryItem {
  id : string
}