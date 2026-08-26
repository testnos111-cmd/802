import * as express from 'express'
import { Api, Database, Util } from ".."
import { GameApiClient } from "./game"

export class ApiClient extends GameApiClient {

    async isVaildUser(_req : express.Request, _res : express.Response, _pass : Function) {

        //console.log(Util.parsePacket(_req))

        let _token : string;

        if(Util.parsePacket(_req).accessToken){
            _token = Util.parsePacket(_req).accessToken;
        } else {
            _token = "none"
        }

        const _db = await Database.conn()

        var _result = await _db.collection('users').find({
            token : _token
        }).toArray()
    
        /* Check Vaild */
        if(!(_result.length > 0)) {
            let _returnData : Api.returnData = {
                status : 500,
                message : "",
                data : {}
            }

            Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);
        } else {
            _pass();
        }

    }

    async checkApiToken(_req : express.Request, _res : express.Response, _pass : Function) {
        let _token : string;

        if(_req.query.access_token) {
            _token = String(_req.query.access_token)
        } else {
            _token = "none"
        }

        const _db = await Database.conn();

        var _result = await _db.collection('users').find({
            token : _token
        }).toArray()

        if(!(_result.length > 0)) {
            _res.status(403).json({ status : 403, data : { success : false, message : "Token isn't vaild" } })
        } else {
            _pass();
        }
    }

    async joinUser(_req : express.Request) : Promise<Api.result> {
        
        const _db = await Database.conn()

        var _result = await _db.collection('users').find({}).toArray()

        var _newToken : string = Util.getRandomToken(Api.config.tokenLength);

        var _playerData : Api.playerData = {
            token : _newToken,
            data : {
                userData : {
                    ip : _req.connection.remoteAddress.split("::ffff:")[1],
                    nickname : "NO NAME",
                    currentScore : 0,
                    memberSeq : _result.length + 1,
                    isReadyForLeague : false,
                    ovenStatus : [],
                    normalQuestList : [],
                    episodePlayInfoList : [
                        ...await Api.config.episodePlayInfoList
                    ],
                    unlockEpisodeQuestList : [],
                    currentEpisodeSeq : 0,
                    keyRestoredTime : Date.now(),
                    lifeRestoredTime : Date.now(),
                    missionInfoList : [],
                    lastUsedCharacterGroupSeq : 200100,
                    lastUsedPetGroupSeq : 100100,
                    episodeUserInfo : [
                       ...Api.config.defaultEpisodeUserInfo
                    ],
                    cashInfo : {
                        gem : Api.config.cashInfo.gem,
                        coin : Api.config.cashInfo.coin,
                        life : Api.config.cashInfo.life,
                        key : Api.config.cashInfo.key,
                        powder : Api.config.cashInfo.powder,
                        medal : Api.config.cashInfo.medal,
                        shard : Api.config.cashInfo.shard,
                        pointResult : {
                            todayPoint : Api.config.cashInfo.pointResult.todayPoint,
                            currentPoint : Api.config.cashInfo.pointResult.currentPoint,
                            todayWinPoint : Api.config.cashInfo.pointResult.todayWinPoint,
                            todayBragPoint : Api.config.cashInfo.pointResult.todayBragPoint,
                            todayHeartPoint : Api.config.cashInfo.pointResult.todayHeartPoint,
                            giftCount : Api.config.cashInfo.pointResult.giftCount,
                            updateDt : Date.now()
                        }
                        
                    },
                    levelData : { 
                        ...Api.config.levelData 
                    },
                },
                inventory : {
                    data : [...Api.config.defaultStuff]
                },
            }
        } 

        var _res = await _db.collection('users').find({
            token : _newToken
        }).toArray()
    
        /* Check Duplicate */
        _res.length > 0 ? this.joinUser(_req) : 0;
    
        /* Add New User */
        _db.collection('users').insertOne(_playerData);
    
        var result : Api.result = {
            status : 0,
            success : true,
            data : {
                token : _newToken
            }
        }
        return result;
    }

    async loginUser(_token : string) : Promise<Api.result> {

        const _db = await Database.conn()

        var _playerData : Api.playerData = {
            token : _token
        } 

        var _res = await _db.collection('users').find(_playerData).toArray()

        var result : Api.result = {
            status : 0,
            success : true,
            data : _res[0]
        }
        
        return result;
    }

    async getMyInfo(_token : string) : Promise<Api.result> {
        const _db = await Database.conn()

        let _userData : Api.userData = {
            token : _token
        }

        let _data = await _db.collection('users').findOne(_userData)

        var data : Api.myInfo = {
            status: 0,
            user_id: _token,
            hashed_talk_user_id : null,
            message_blocked: false,
            verified: true,
            nickname: _data.data.userData.nickname,
            profile_image_url: "",
            country_iso: "KO"
        }

        var result : Api.result = {
            status : 0,
            success : true,
            data : data
        }

        return result;
    }
    
    async getFrinedsInfo(_token : string) : Promise<Api.result> {

        const _db = await Database.conn()
        let _query = {}

        let _firendList = await Util.getFriend(_token)

        let _friendInfoList = [];

        _firendList.forEach(x=>{
            _friendInfoList.push({
                "user_id":`${x.data.userData.memberSeq}`,
                "nickname":`${x.data.userData.nickname}`,
                "profile_image_url":"",
                "message_blocked":false
            })
        })

        var _data = {
            "status": 0,
            "friends_count": _friendInfoList.length,
            "app_friends_info": [
                ..._friendInfoList
            ],
            "friends_info": []
          }


          var _result : Api.result = {
            status : 0,
            success : true,
            data : _data
        }

        return _result;


    }
}