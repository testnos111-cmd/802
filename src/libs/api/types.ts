export interface myInfo {
    status: number,
    user_id: string,
    hashed_talk_user_id: string | null,
    message_blocked: boolean,
    verified: boolean,
    nickname: string,
    profile_image_url: string,
    country_iso: "KO" | "EN" | "CN"
}

export interface friendsInfo {
    status: number,
    friends_count: number,
    app_friends_info: Array<object> | null,
    friends_info: Array<object> | null
} 

export interface userData {
    token : string
}

export interface result {
    status : number, 
    success : boolean,
    data : any
}

interface episodeUserInfo {
    episodeSeq: number,
    unlocked: boolean
}

export interface itemStuff {
    stuffSeq : number, 
    stuffLeftCount: number, 
    stuffLevel: number
}

export interface playerData {
    _id? : any,
    token : string,
    data? : {
        userData : {
            ip : string,
            nickname : string, //이름
            currentScore : number,
            memberSeq : number,
            isReadyForLeague : boolean,
            ovenStatus : Array<object>,
            normalQuestList : Array<number>,
            episodePlayInfoList : Array<playInfoList>,
            unlockEpisodeQuestList : Array<number>,
            episodeUserInfo : Array<episodeUserInfo>,
            currentEpisodeSeq : number,
            keyRestoredTime : number,
            lifeRestoredTime : number,
            missionInfoList : Array<object>,
            lastUsedCharacterGroupSeq : number,
            lastUsedPetGroupSeq : number,
            cashInfo : {
                gem: number,
                coin: number,
                life: number,
                key: number,
                powder: number,
                medal: number,
                shard: number,
                pointResult: {
                    todayPoint: number,
                    currentPoint: number,
                    todayHeartPoint: number,
                    todayWinPoint: number,
                    todayBragPoint: number,
                    giftCount: number,
                    updateDt: number
                }
            },
            levelData : {
                lv : number,
                exp : number
            }
        },
        inventory : {
            data : object
        },
    }
}

export interface playHistory {
    userLevel : number,
    score : number,
    cookie : string,
    cookie2 : string,
    pet : string,
    treasure0 : string,
    treasure1 : string,
    treasure2 : string,
}

export interface playInfoList {
    episodeSeq : number,
    playHistory : playHistory,
    lastPlayHistory : playHistory,
    alltimeHighPlayHistory : playHistory,
    isCurrentWeek : number
}


export interface friendInfoData { 
    user_id : string,
    nickname: string,
    profile_image_url: string,
    message_blocked: boolean
}