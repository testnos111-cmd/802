import { config } from "process";
import { Database, Api, Util } from "../..";
import { GamePlayClient } from "./play";
import { episodeRankData } from "./types";
import * as express from "express"

/** 
 * 앱 자체에서 충전시간을 정해버리는 문제가 있음
 * 따라서, 시간 오프셋을 맞추어 주는 함수 제작
*/

function getLifeRestoredTime(_lifeRestoredTime : number) {
    let _lifeOffset = 8 * 60 * 1000
    return _lifeRestoredTime - _lifeOffset
}

function getKeyRestoredTime(_keyRestoredTime : number) {
    let _keyOffset = 20 * 60 * 1000
    return _keyRestoredTime - _keyOffset
}

export class ManageResources {

    async getPoint(_token : string, _count : number) {
        const _db = await Database.conn();
        let _userData = await Util.getMemberInfo(_token);
        
        let _currentPoint : number = Number(_userData.data.data.userData.cashInfo.pointResult.currentPoint);
        let _currentGiftCount : number = Number(_userData.data.data.userData.cashInfo.pointResult.giftCount);

        let _addGiftCount : number = 0;
        let _finalPoint : number = _currentPoint + _count;

        if(_finalPoint >= 100){
            _addGiftCount = Math.floor( _finalPoint / 100 );
            _finalPoint = _finalPoint % 100;
        }

        await _db.collection("users").updateOne({
            token : _token
        }, {
            $set : {
                "data.userData.cashInfo.pointResult.currentPoint" : _finalPoint,
                "data.userData.cashInfo.pointResult.giftCount" : _currentGiftCount + _addGiftCount
            }
        })

        return;
        
    }


    /**
     * 
     * @param _token User's access token
     * @param _count Exp amount user get
     */
    async getExp(_token : string, _count : number) {
        const _gameDataClient = new GameDataClient
        const _db = await Database.conn();

        let _userLevelData = await _gameDataClient.getUserLevelData(_token);

        /** Update exp data */
        await _db.collection('users').updateOne({
                token : _token
            },{
        $set : {
                "data.userData.levelData.exp" : _userLevelData.exp + _count
            }
        })

        /** Check level up */
        await _gameDataClient.checklevelUp(_token);

    }

    /**
    * 
    * @param _token accessToken
    * @param _count 유저가 사용할 생명 갯수
    * @returns boolean
    */
    async useLife(_token: string, _count: number) {

        const _db = await Database.conn();

        let _lifeRestoredTime = Date.now() + Api.config.lifeChargeMin * 60 * 1000

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        let _lifeCount = Number(_result.data.userData.cashInfo.life)


        /** 데이터 베이스에서 생명값만 업데이트 */
        if (_lifeCount - _count >= 0) {
            if(_lifeCount == 5) { /** 생명 값 5일때 생명 쓰면, RestoredTime 재설정 */

                await _db.collection("users").updateOne({ token: _token }, {
                    $set: {
                        "data.userData.cashInfo.life": _lifeCount - _count,
                        "data.userData.lifeRestoredTime" : getLifeRestoredTime(_lifeRestoredTime)
                    }
                })

                setTimeout(()=>{ this.getLife(_token, 1, "auto") }, _lifeRestoredTime - Date.now())

            } else {

                await _db.collection("users").updateOne({ token: _token }, {
                    $set: {
                        "data.userData.cashInfo.life": _lifeCount - _count,
                    }
                })

            }
           

            return true

        } else {
            return false
        }


    }


    /**
    * 
    * @param _token accessToken
    * @param _count 유저가 얻을 생먕 갯수
    * @returns boolean
    */
    async getLife(_token: string, _count: number, _type ? : string) {
        
        console.log(_type)

        const _db = await Database.conn();

        
        let _lifeRestoredTime =  Date.now() + Api.config.lifeChargeMin * 60 * 1000

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        let _lifeCount = Number(_result.data.userData.cashInfo.life)

        /** 데이터 베이스에서 생명값과 초기화 시간 업데이트 */

        if (_lifeCount + _count >= 5) { /** 다음 생명이 5가 넘으면... 그냥 체력 충전 완료로 생각함. */

            /** 5보다 클때 더이상 늘어나지 않게 설정 */
            if( _lifeCount + _count > 5 && _type == "auto") { return; }

            await _db.collection("users").updateOne({ token: _token }, {
                $set: {
                    "data.userData.cashInfo.life": _lifeCount + _count,
                    "data.userData.lifeRestoredTime" : getLifeRestoredTime(Date.now())
                }
            })

        } else {
            
            await _db.collection("users").updateOne({ token: _token }, {
                $set: {
                    "data.userData.cashInfo.life": _lifeCount + _count,
                    "data.userData.lifeRestoredTime" : getLifeRestoredTime(_lifeRestoredTime)
                }
            })


            setTimeout(()=>{ this.getLife(_token, 1, "auto"); }, _lifeRestoredTime - Date.now()) /** 일정시간 뒤에  */

        }

        return true;
    }



    
    /**
    * 
    * @param _token User accessToken
    * @param _count 유저가 사용할 열쇠 갯수
    * @returns boolean
    */
    async useKey(_token: string, _count: number) {

        const _db = await Database.conn();

        let _keyRestoredTime = Date.now() + Api.config.keyChargeMin * 60 * 1000

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        let _keyCount = Number(_result.data.userData.cashInfo.key)


        /** 데이터 베이스에서 생명값만 업데이트 */
        if (_keyCount - _count >= 0) {
            if(_keyCount == 3) { /** 생명 값 5일때 생명 쓰면, RestoredTime 재설정 */

                await _db.collection("users").updateOne({ token: _token }, {
                    $set: {
                        "data.userData.cashInfo.key": _keyCount - _count,
                        "data.userData.keyRestoredTime" : getKeyRestoredTime(_keyRestoredTime)
                    }
                })

                setTimeout(()=>{ this.getKey(_token, 1, "auto") }, _keyRestoredTime - Date.now())

            } else {

                await _db.collection("users").updateOne({ token: _token }, {
                    $set: {
                        "data.userData.cashInfo.key": _keyCount - _count,
                    }
                })

            }
           

            return true

        } else {
            return false
        }


    }


    /**
    * 
    * @param _token accessToken
    * @param _count 유저가 받을 열쇠 갯수
    * @returns boolean
    */
    async getKey(_token: string, _count: number, _type? : string) {
        

        const _db = await Database.conn();

        
        let _keyRestoredTime =  Date.now() + Api.config.keyChargeMin * 60 * 1000

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        let _keyCount = Number(_result.data.userData.cashInfo.key)

        /** 데이터 베이스에서 생명값과 초기화 시간 업데이트 */

        if (_keyCount + _count >= 3) { /** 다음 열쇠의 숫자가 3이 넘으면... 그냥 열쇠 충전 완료로 생각함. */

            /** 3보다 클때 더이상 늘어나지 않게 설정 */
            if( _keyCount + _count > 3 && _type == "auto") { return; }

            await _db.collection("users").updateOne({ token: _token }, {
                $set: {
                    "data.userData.cashInfo.key": _keyCount + _count,
                    "data.userData.keyRestoredTime" : getKeyRestoredTime(Date.now())
                }
            })

        } else {
            
            await _db.collection("users").updateOne({ token: _token }, {
                $set: {
                    "data.userData.cashInfo.key": _keyCount + _count,
                    "data.userData.keyRestoredTime" : getKeyRestoredTime(_keyRestoredTime)
                }
            })


            setTimeout(()=>{ this.getKey(_token, 1, "auto"); }, _keyRestoredTime - Date.now()) /** 일정시간 뒤에  */

        }

        return true;
    }



    /**
     * 
     * @param _token accessToken
     * @param _count 유저가 사용할 젬 갯수
     * @returns boolean
     */
    async useGem(_token: string, _count: number) {

        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        let _gemCount = _result.data.userData.cashInfo.gem

        /** 데이터 베이스에서 코인값 업데이트 */
        if (_gemCount - _count >= 0) {
            await _db.collection("users").updateOne({ token: _token }, {
                $set: {
                    "data.userData.cashInfo.gem": _gemCount - _count
                }
            })

            return true

        } else {
            return false
        }
    }

    /**
 * 
 * @param _token accessToken
 * @param _count 유저가 받을 젬 갯수
 * @returns boolean
 */
    async getGem(_token: string, _count: number) {

        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        let _gemCount = _result.data.userData.cashInfo.gem

        /** 데이터 베이스에서 코인값 업데이트 */
        if (_gemCount + _count >= 0) {
            await _db.collection("users").updateOne({ token: _token }, {
                $set: {
                    "data.userData.cashInfo.gem": _gemCount + _count
                }
            })

            return true

        } else {
            return false
        }
    }


    /**
     * 
     * @param _token accessToken
     * @param _count 유저가 사용할 코인 갯수
     * @returns boolean
     */
    async useCoin(_token: string, _count: number) {
        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        if (_result) {
            let _coinCount = _result.data.userData.cashInfo.coin

            /** 데이터 베이스에서 젬값 업데이트 */
            if (_coinCount - _count >= 0) {
                await _db.collection("users").updateOne({ token: _token }, {
                    $set: {
                        "data.userData.cashInfo.coin": _coinCount - _count
                    }
                })

                return true

            } else {
                return false
            }
        } else {
            return false
        }
    }


    /**
     * 
     * @param _token accessToken
     * @param _count 유저가 받을 코인 갯수
     * @returns boolean
     */
    async getCoin(_token: string, _count: number) {
        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        if (_result) {
            let _coinCount = _result.data.userData.cashInfo.coin

            /** 데이터 베이스에서 젬값 업데이트 */
            if (_coinCount + _count >= 0) {
                await _db.collection("users").updateOne({ token: _token }, {
                    $set: {
                        "data.userData.cashInfo.coin": _coinCount + _count
                    }
                })

                return true

            } else {
                return false
            }
        } else {
            return false
        }
    }

    /**
     * 
     * @param _token accessToken
     * @param _stuffSeq itemSeq
     * @returns boolean
     */
    async getInventoryItem(_token: string, _stuffSeq: number) {
        const _db = await Database.conn();
        let _stuffLevel: number;

        /** 
         * @var _stuffSeq 의 String길이가 5이상일 경우 레벨이 없는 아이템으로 판단. 
         * 따라서, Seq정보는 변경하지 않고, 레벨 데이터를 0으로 수정
         */
        if (String(_stuffSeq).length < 5) {

            _stuffLevel = 0;

        } else {

            _stuffLevel = Number(String(_stuffSeq).substr(-2))

            _stuffSeq = Number(String(_stuffSeq).slice(0, -2) + "00");

        }

        let _userData: any = (await _db.collection("users").findOne({
            token: _token,
            "data.inventory.data.stuffSeq": _stuffSeq
        }))




        if (_userData) {


            for (let i in _userData.data.inventory.data) {
                if (_userData.data.inventory.data[i].stuffSeq == _stuffSeq) {


                    let _invertoryStuff = _userData.data.inventory.data[i]

                    /** 
                    * 요청 레벨과 현재 레벨이 같지 않으면, 레벨업으로 인식 
                    */

                    if (_invertoryStuff.stuffLevel !== _stuffLevel) {
                        await _db.collection("users").updateOne({
                            token: _token,
                            "data.inventory.data.stuffSeq": _stuffSeq
                        }, {
                            $set: {
                                "data.inventory.data.$.stuffLevel": _stuffLevel
                            }
                        })

                        /** 
                         * 요청 레벨과 현재레벨이 같다면, 수량을 추가 
                         */
                    } else {
                        await _db.collection("users").updateOne({
                            token: _token,
                            "data.inventory.data.stuffSeq": _stuffSeq
                        }, {
                            $set: {
                                "data.inventory.data.$.stuffLeftCount": _invertoryStuff.stuffLeftCount + 1
                            }
                        })
                    }

                }
            }


            if (_userData.stuffLevel !== _stuffLevel) {
                await _db.collection("users").updateOne({
                    token: _token,
                    "data.inventory.data.stuffSeq": _stuffSeq
                }, {
                    $set: {
                        "data.inventory.data.$.stuffLevel": _stuffLevel
                    }
                })

                /** 
                 * 요청 레벨과 현재레벨이 같다면, 수량을 추가 
                 */
            } else {
                await _db.collection("users").updateOne({
                    token: _token,
                    "data.inventory.data.stuffSeq": _stuffSeq
                }, {
                    $set: {
                        "data.inventory.data.$.stuffLeftCount": _userData.stuffLeftCount + 1
                    }
                })
            }

        } else {
            /**
             * 데이터 업데이트 
             */
            await _db.collection("users").updateOne({
                token: _token,
            }, {
                $push: {
                    "data.inventory.data": {
                        stuffSeq: _stuffSeq,
                        stuffLeftCount: 1,
                        stuffLevel: _stuffLevel
                    }
                }
            })
        }
        return true
    }

    /**
     * 
     * @param _token accessToken
     * @param _stuffSeq itemSeq
     * @returns boolean
     */
    async useInventoryItem(_token: string, _stuffSeq: number) {
        const _db = await Database.conn();
        let _stuffLevel: number;

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        /** 
         * @var _stuffSeq 의 String길이가 5이상일 경우 사용할 수 없는 아이템으로 판단. 
         */
        if (String(_stuffSeq).length >= 5) {

            _stuffSeq = Number(String(_stuffSeq).slice(0, -2) + "00");

        }

        let _result2: any = (await _db.collection("users").findOne({
            token: _token,
            "data.inventory.data.stuffSeq": _stuffSeq
        }))

        if (_result2) {

            for (let i in _result2.data.inventory.data) {
                if (_result2.data.inventory.data[i].stuffSeq == _stuffSeq) {


                    let _invertoryStuff = _result2.data.inventory.data[i]

                    /** 
                    * 사용하고 남은 양이 0보다 크다면, 1을 제거하고, 작다면 배열에서 그냥 없애버린다.
                    */

                    if (_invertoryStuff.stuffLeftCount - 1 > 0) {
                        await _db.collection("users").updateOne({
                            token: _token,
                            "data.inventory.data.stuffSeq": _stuffSeq
                        }, {
                            $set: {
                                "data.inventory.data.$.stuffLeftCount": _invertoryStuff.stuffLeftCount - 1
                            }
                        })
                    } else {
                        await _db.collection("users").updateOne({
                            token: _token,
                            "data.inventory.data.stuffSeq": _stuffSeq
                        }, {
                            $pull: {
                                "data.inventory.data": { stuffSeq: _stuffSeq }
                            }
                        })
                    }
                }
            }

        } else {
            return false;
        }
        return true
    }
}

export class GameDataClient {

    private _resourcesClient = new ManageResources;

    async getInventoryData(_token: string): Promise<Array<Api.inventoryItem>> {
        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        let _arr: Array<Api.inventoryItem> = []
        for (let key in _result.data.inventory) {
            _result.data.inventory[key].forEach((x: Api.itemStuff) => {
                if (x.stuffLeftCount == 1 || x.stuffLeftCount == 0) {
                    _arr.push({ id: `${x.stuffSeq}:${x.stuffLevel}` })
                } else {
                    _arr.push({ id: `${x.stuffSeq}:${x.stuffLevel}x${x.stuffLeftCount}` })
                }
            });
        }

        return _arr
    }

    async changeEpisodeData(_token : string, _episodeSeq : number) { 

        const _db = await Database.conn();

        await _db.collection('users').updateOne({
            token : _token
        }, {
            $set : {
                "data.userData.currentEpisodeSeq" : _episodeSeq
            }
        })

        return;
    }

    /** Getting user level data */
    async getUserLevelData(_token : string): Promise<Api.playerLevelData> {
        let _userData = await Util.getMemberInfo(_token);

        let _returnData : Api.playerLevelData = {
            lv : _userData.data.data.userData.levelData.lv,
            exp : _userData.data.data.userData.levelData.exp
        }

        return _returnData;
       

    }

    /** level up player if exp reach next level */
    async checklevelUp(_token : string) {

        const _db = await Database.conn()

        /** Get level data from config */
        const _levelData = Api.config.levelContent
        
        /** Get default data */
        let _userLevelData = await this.getUserLevelData(_token);

        /** Check user level max */
        if(_userLevelData.lv == Api.config.maxLevel){ return; }

        /** Check user level up */
        if( _levelData[_userLevelData.lv + 1]['Exp'] <=  _userLevelData.exp){

            /** Update lv and exp data */
            await _db.collection('users').updateOne({
                token : _token
            },{
                $set : {
                    "data.userData.levelData.exp" : _userLevelData.exp,
                    "data.userData.levelData.lv" : _userLevelData.lv + 1
                }
            })

            await this._resourcesClient.getCoin(_token, Number(_levelData[_userLevelData.lv + 1]['Reward_Coin']));
            await this._resourcesClient.getGem(_token, Number(_levelData[_userLevelData.lv + 1]['Reward_Gem']));

            /** Using recursive function for multiple level up */
            await this.checklevelUp(_token);

            return;

        }

        return;

    }

}

export class GameApiClient extends GamePlayClient {

    /** 
     * 2024-01-11
     * None @var _token Functions
    */

    async getServerTime(_req: express.Request, _res: express.Response) {

        let _data: Api.serverTime = {
            timeMillis: Date.now(),
            formattedTime: Util.getTime(new Date()),
            nextResetTime: Date.now() + 100000000,
            leagueEndDt: Date.now(),
            nextLeagueStartDt: Date.now()
        }

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _data
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getVersionCombo(_req: express.Request, _res: express.Response) {


        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {}
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getClientLog(_req: express.Request, _res: express.Response) {

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {}
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async configCheck(_req: express.Request, _res: express.Response) {

        let _data = {
            "configList":[
                {"key":"shop.buytype.211","type":"CLIENT","value":"0"},
                {"key":"shop.buytype.212","type":"CLIENT","value":"0"},
                {"key":"shop.buytype.213","type":"CLIENT","value":"0"},
                {"key":"shop.buytype.214","type":"CLIENT","value":"0"},
                {"key":"shop.buytype.215","type":"CLIENT","value":"0"},
                {"key":"shop.buytype.216","type":"CLIENT","value":"0"},
                {"key":"shop.booster.max_count","type":"CLIENT","value":"0"},
                {"key":"game.guest_login_on_off_version","type":"CLIENT","value":"5471"},
                {"key":"shop.client_contents_version.ios","type":"CLIENT","value":"10031"},
                {"key":"shop.client_contents_version.android","type":"CLIENT","value":"10031"},
                {"key":"game.download_manager_on_off_version.ios","type":"CLIENT","value":"99999"},
                {"key":"client.sending_life_on_off_version.ios","type":"CLIENT","value":"10031"},
                {"key":"client.sending_life_on_off_version.android","type":"CLIENT","value":"10031"},
                {"key":"client.coupon_button_on_off_version.ios","type":"CLIENT","value":"10031"},
                {"key":"client.coupon_button_on_off_version.android","type":"CLIENT","value":"10031"},
                {"key":"client.invite_event_button_on_off_version.ios","type":"CLIENT","value":"10031"},
                {"key":"client.invite_event_button_on_off_version.android","type":"CLIENT","value":"10031"},
                {"key":"client.notice_on_off_version.ios","type":"CLIENT","value":"10031"},
                {"key":"client.notice_on_off_version.android","type":"CLIENT","value":"10031"},
                {"key":"client.inactive_user_on_off_version.ios","type":"CLIENT","value":"10031"},
                {"key":"client.inactive_user_on_off_version.android","type":"CLIENT","value":"10031"},
                {"key":"client.cookierun_mall_button_on_off_version.ios","type":"CLIENT","value":"10011"},
                {"key":"client.cookierun_mall_button_on_off_version.android","type":"CLIENT","value":"10011"},
                {"key":"client.gem_shop_mall_link_button_on_off_version.ios","type":"CLIENT","value":"10011"},
                {"key":"client.gem_shop_mall_link_button_on_off_version.android","type":"CLIENT","value":"10011"},
                {"key":"client.review_reward_condition_on_off_version.ios","type":"CLIENT","value":"99999"},
                {"key":"client.review_reward_condition_on_off_version.android","type":"CLIENT","value":"99999"},
                {"key":"dm.forced_file_sync_version.ios","type":"CLIENT","value":"9"},
                {"key":"dm.forced_file_sync_version.android","type":"CLIENT","value":"8"},
                {"key":"client.push_reset_when_install","type":"CLIENT","value":"1"},
                {"key":"client.show_rating_on_off","type":"CLIENT","value":"1"},
                {"key":"client.agreement.version","type":"CLIENT","value":"2"},
                {"key":"client.crepe.enabled.ios","type":"CLIENT","value":"0"},
                {"key":"client.crepe.enabled.android","type":"CLIENT","value":"1"},
                {"key":"client.crepe.reset.ios","type":"CLIENT","value":"0"},
                {"key":"client.crepe.reset.android","type":"CLIENT","value":"0"},
                {"key":"client.network.low_speed_limit","type":"CLIENT","value":"1"},
                {"key":"client.network.low_speed_time","type":"CLIENT","value":"30"},
                {"key":"client.analytics.enabled","type":"CLIENT","value":"1"},
                {"key":"client.analytics.report_event_threshold","type":"CLIENT","value":"20"},
                {"key":"client.analytics.user_divider","type":"CLIENT","value":"1"},
                {"key":"client.crepe.cdn_url","type":"CLIENT","value":"0"},
                {"key":"client.ab_test.user_divider","type":"CLIENT","value":"4"},
                {"key":"client.crnet.on","type":"CLIENT","value":"1"},
                {"key":"reward.max_activity_point_per_day","type":"ALL","value":"1800"},
                {"key":"reward.invite.activity_point","type":"ALL","value":"20"},
                {"key":"reward.life_mail.activity_point","type":"ALL","value":"5"},
                {"key":"reward.invite_friend.cooltime","type":"ALL","value":"2592000000"},
                {"key":"reward.brag.activity_point","type":"ALL","value":"5"},
                {"key":"reward.send_life.activity_point","type":"ALL","value":"3"},
                {"key":"reward.invite_friend.enabled","type":"ALL","value":"1"},
                {"key":"game.key_max_buying_with_heart_per_day","type":"ALL","value":"5"},
                {"key":"reward.link_invite_friend.enabled","type":"ALL","value":"0"},
                {"key":"reward.max_heart_activity_point_per_day","type":"ALL","value":"240"},
                {"key":"reward.max_win_activity_point_per_day","type":"ALL","value":"1000"},
                {"key":"reward.max_brag_activity_point_per_day","type":"ALL","value":"100"},
                {"key":"shop.pet_gasha_min_client_version.ios","type":"ALL","value":"10009"},
                {"key":"shop.pet_gasha_min_client_version.android","type":"ALL","value":"10019"},
                {"key":"shop.tr_gasha_min_client_version.ios","type":"ALL","value":"10009"},
                {"key":"shop.tr_gasha_min_client_version.android","type":"ALL","value":"10019"},
                {"key":"reward.max_heart_event_activity_point_per_day","type":"ALL","value":"240"},
                {"key":"reward.max_brag_event_activity_point_per_day","type":"ALL","value":"100"},
                {"key":"reward.max_event_activity_point_per_day","type":"ALL","value":"1970"},
                {"key":"reward.send_life.event_activity_point","type":"ALL","value":"6"},
                {"key":"reward.brag.event_activity_point","type":"ALL","value":"10"},
                {"key":"reward.daily.activity_point","type":"ALL","value":"30"},
                {"key":"reward.win.activity_point","type":"ALL","value":"2"},
                {"key":"line.friend_list.from_server.enabled","type":"ALL","value":"0"},
                {"key":"reward.invite_friend.daily_friend_invite_limit","type":"ALL","value":"61"},
                {"key":"reward.comeback.returned.reward_type","type":"ALL","value":"E"},
                {"key":"reward.comeback.returned.reward_qty","type":"ALL","value":"3"},
                {"key":"reward.comeback.returned.reward_stuff_seq","type":"ALL","value":"0"},
                {"key":"shop.oven_max_level","type":"ALL","value":"1"},
                {"key":"game.dough_max_capacity","type":"ALL","value":"9"}
            ]}

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _data
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    /**
     * 2024-01-11
     * With @var _token Functions
     */



    async setPushStatus(_req : express.Request, _res : express.Response) {
        let _token: string = Util.parsePacket(_req).accessToken

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {}
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);
    }

    async getInitData(_req: express.Request, _res: express.Response) {

        const _dataClient = new GameDataClient

        let _token: string = Util.parsePacket(_req).accessToken

        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))



        let _userData: Api.initMemberData = {
            currentEpisodeSeq: _result.data.userData.currentEpisodeSeq,
            episodePlayInfoList: _result.data.userData.episodePlayInfoList,
            episodeUserInfo: _result.data.userData.episodeUserInfo,
            comebackRewardList: [],
            keyCount: _result.data.userData.cashInfo.key,
            keyRestoredTime: _result.data.userData.keyRestoredTime,
            missionInfoList: [],
            missionRewardList: [],
            collectibleItemList: [],
            stuffList: [],
            currentScore: _result.data.userData.currentScore,
            memberSeq: _result.data.userData.memberSeq,
            friendInviteCount: 0,
            receiveKakaoMessage: 1,
            reviewRewardFlag: 1,
            lv: _result.data.userData.levelData.lv, 
            exp: _result.data.userData.levelData.exp, 
            lastUsedCharacterGroupSeq: _result.data.userData.lastUsedCharacterGroupSeq,
            lastUsedPetGroupSeq: _result.data.userData.lastUsedPetGroupSeq,
            pushStatus: 1,
            noticePushStatus: 1,
            lifePushStatus: 1,
            winPushStatus: 1,
            receiveFortunePushStatus: 1,
            receiveWeeklyPushStatus: 1,
            lastDailyRewardTimestamp: Date.now(), //내일 작업함 ㅅㄱ
            secondeReviewFlag: 1,
            resultFreeMixedGashaInfoList: [],
            lifeCount: _result.data.userData.cashInfo.life,
            lifeRestoredTime: _result.data.userData.lifeRestoredTime,
            friendWinCount: 0,
            receivedGiftCount: 0,
            fbLikeRewardFlag: 0,
            episodeFinishedQuestList: [],
            availableBuyKeyWithHeart: 5000,
            neverAgainGashaReward: [],
            purchasedPackageList: [],
            ovenStatusList: _result.data.userData.ovenStatus,
            cashInfo: { ..._result.data.userData.cashInfo },
            showMiniGame: 0,
            eventPlanList: [],
            rewardMailList: [],
            presetList: [],
            buffList: [],
            attendanceTableType: "ORDINARY",
            attendanceRewardList: [],
            attendanceRewardCount: 0,
            attendanceRewardEndDate: 0,
            isReadyForLeague: _result.data.userData.isReadyForLeague,
            nickname: `${_result.data.userData.nickname}`,
            comboName: null,
            comboExpireDt: Date.now(),
            timeMillis: Date.now(),
            formattedTime: Util.getTime(new Date()),
            nextResetTime: Date.now() + 100000000, //TODO
            cashItemList: [ ...Api.config.cashItemInfo ],
            inventoryItemList: await _dataClient.getInventoryData(_token),
            petList: [
                ...Api.config.petList
            ], //펫 판매 목록
            characterList: [], //체험하기
            normalQuestList: [],
            unlockEpisodeQuestList: []
        }

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _userData
        }

        //console.log(_userData)

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getEpisodeFriendInfo(_req: express.Request, _res: express.Response) {
        let _body = Util.parsePacket(_req)
        let _token: string = _body.accessToken
        let _episodeSeq = _body.episodeSeq

        let _friendList = await Util.getFriend(_token, _body.friendMidList.map(Number))
        let _episodeFriendInfoList = [];

        for (let i = 0; i < _friendList.length; i++) {
            let _episodeData = await Util.getScore(_friendList[i], _episodeSeq);

            _episodeFriendInfoList.push({
                "friendDataDidChange": false,
                "friendMid": `${_friendList[i].data.userData.memberSeq}`,
                "memberSeq": _friendList[i].data.userData.memberSeq,
                "lv": _friendList[i].data.userData.levelData.lv,
                "pushStatus": 1,
                "receiveKakaoMessage": 1,
                "isCurrWeek": 1,
                "hasPlayed": 1,
                "friendWinCount": 0,
                "allTimeHighScore": `${_episodeData.alltimeHighPlayHistory.score}`,
                "weeklyScore": `${_episodeData.playHistory.score}`,
                "lastPlayCombi": {
                    "cookie": `${_episodeData.lastPlayHistory.cookie}`,
                    "cookie2": `${_episodeData.lastPlayHistory.cookie2}`,
                    "pet": `${_episodeData.lastPlayHistory.pet}`,
                    "treasure0": `${_episodeData.lastPlayHistory.treasure0}`,
                    "treasure1": `${_episodeData.lastPlayHistory.treasure1}`,
                    "treasure2": `${_episodeData.lastPlayHistory.treasure2}`,
                },
                "inactiveUserInfo": {
                    "comebackRequestType": 0,
                    "comebackRequestRewardQty": 150,
                    "inactiveFlag": 0,
                    "comebackRequestRewardType": "A",
                    "comebackRequestRewardStuffSeq": 0,
                    "comebackRequestTime": 0
                },
                "currRatingSeq": 1,
                "topRatingSeq": 1,
                "currLeagueRank": 36,
                "topLeagueRank": 36
            })

        }

        let _friendsData = {
            "episodeSeq": _episodeSeq,
            "episodeFriendInfoList": [
                ..._episodeFriendInfoList
            ],
            "episodeRankInFriendsList": [
                { "episodeSeq": 1, "friendWinCount": 0, "totalFriendCount": _friendList.length, "isPlayedThisWeek": 1 },
                { "episodeSeq": 2, "friendWinCount": 0, "totalFriendCount": _friendList.length, "isPlayedThisWeek": 1 },
                { "episodeSeq": 3, "friendWinCount": 0, "totalFriendCount": _friendList.length, "isPlayedThisWeek": 1 },
                { "episodeSeq": 4, "friendWinCount": 0, "totalFriendCount": _friendList.length, "isPlayedThisWeek": 1 },
                { "episodeSeq": 5, "friendWinCount": 0, "totalFriendCount": _friendList.length, "isPlayedThisWeek": 1 },
                { "episodeSeq": 501, "friendWinCount": 0, "totalFriendCount": _friendList.length, "isPlayedThisWeek": 1 }
            ],
            "lifeMailCount": 0,
            "rewardMailCount": 0,
            "currentFriendCount": _friendList.length,
            "maxFriendCount": _friendList.length,
            "friendDataDidChange": true,
        }

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _friendsData
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);


    }

    async getEpisodeWeeklyRank(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken
        let _body = Util.parsePacket(_req)

        // console.log(_body)


        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))

        //let _friendList = await Util.getFriend(_token, _body.friendList.map((x)=>{ return Number(x['memberSeq']) }))
        

        let _rankData: episodeRankData = {
            "episodeRankInfoList": [],
            "friendWinCount": 0,
            "leagueResult": {
                "episodeSeq": _body.episodeSeq
            },
            "cashInfo": {
                ..._result.data.userData.cashInfo
            },
        }

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _rankData
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getdailyBonus(_req : express.Request, _res : express.Response) {

        //TODO
        
    }

    /**
     * 
     * @param _token accessToken
     * @param _nickname user nickname
     * @returns boolean
     */
    async changeNickname(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken
        let _nickname = Util.parsePacket(_req).nickname

        const _db = await Database.conn();

        await _db.collection("users").updateOne({ token: _token }, {
            $set: {
                "data.userData.nickname": _nickname,
                "data.userData.isReadyForLeague": true
            }
        })

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {
                nickname: _nickname
            }
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    /**
     * 
     * @param _token accessToken
     * @param _stuffSeq item Seq
     * @param _price item Price
     * @returns @interface Api.returnData
     */
    async buyStuff(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken
        let _stuffSeq = Util.parsePacket(_req).stuffSeq
        let _price = Util.parsePacket(_req).price

        //console.log(Util.parsePacket(_req))

        const _resourceClient = new ManageResources



        /** 아이템 데이터 가져오기 */
        let _gameData = {
            ...(await Util.getAsset('data/gameData/itemData/EquipmentItemSeoul')),
            ...(await Util.getAsset('data/gameData/itemData/TreasureItemDataList'))
        }

        let _playerBuyStuffData : Api.stuffData = _gameData[_stuffSeq]
        
        if(!_playerBuyStuffData){
            return Util.sendError(_res, "NOT VAILD stuffSeq")
        }

        //console.log(_playerBuyStuffData)


        /** buyType이 0이면 일반 구매 */
        if(Util.parsePacket(_req).buyType == 0){

            /** Type A는 일반 구매인것으로 확인됨 */
            if(_playerBuyStuffData.priceA == _price){

                /** 선물 포인트 추가 */
                await _resourceClient.getPoint(_token, Number(_playerBuyStuffData.activity_pointA))

                /** 코인으로 구매 */
                if(_playerBuyStuffData.moneyTypeA == Api.cashTypeList.COIN){
                    await _resourceClient.useCoin(_token, _price)
                }
    
                /** 보석으로 구매 */
                if(_playerBuyStuffData.moneyTypeA == Api.cashTypeList.GEM){
                    await _resourceClient.useGem(_token, _price)
                }

                /** 생명으로 구매 */
                if(_playerBuyStuffData.moneyTypeA == Api.cashTypeList.LIFE){
                    await _resourceClient.useLife(_token, _price)
                }

            } else {
                return Util.sendError(_res, "NOT VAILD REQUEST")
            }
        } 
        
        /** buyType이 1이면 캐시 구매 */
        if(Util.parsePacket(_req).buyType == 1){

            /** Type B 는 캐시 구매인 것으로 확인됨 */
            if(_playerBuyStuffData.priceB == _price){

                /** 선물 포인트 추가 */
                await _resourceClient.getPoint(_token, Number(_playerBuyStuffData.activity_pointB))

                /** 코인으로 구매 */
                if(_playerBuyStuffData.moneyTypeB == Api.cashTypeList.COIN){
                    await _resourceClient.useCoin(_token, _price)
                }
    
                /** 보석으로 구매 */
                if(_playerBuyStuffData.moneyTypeB == Api.cashTypeList.GEM){
                    await _resourceClient.useGem(_token, _price)
                }

                /** 생명으로 구매 */
                if(_playerBuyStuffData.moneyTypeB == Api.cashTypeList.LIFE){
                    await _resourceClient.useLife(_token, _price)
                }
                
            } else {
                return Util.sendError(_res, "NOT VAILD REQUEST")
            }
        } 



        /** 구매 보상이 코인일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.COIN) {
            await _resourceClient.getCoin(_token, Number(_playerBuyStuffData.qty))
        }

        /** 구매 보상이 생명일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.LIFE) {
            await _resourceClient.getLife(_token, Number(_playerBuyStuffData.qty))
        }

        /** 구매 보상이 열쇠일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.KEY){
           await  _resourceClient.getKey(_token, Number(_playerBuyStuffData.qty))
        }

        //////////////////////////// 아이템 /////////////////////////////////

        /** 구매 보상이 쿠키일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.COOKIE) {
            await _resourceClient.getInventoryItem(_token, _stuffSeq)
        }

        /** 구매 보상이 펫일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.PET) {
            await _resourceClient.getInventoryItem(_token, _stuffSeq)
        }

        /** 구매 보상이 보물일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.TREASURE) {
            await _resourceClient.getInventoryItem(_token, _stuffSeq)
        }

        /** 구매 보상이 보물 장착슬릇 확장일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.TREASURE_SLOT_EXPANSION) {
            await _resourceClient.getInventoryItem(_token, _stuffSeq)
        }

        /** 구매 보상이 능력치 일시 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.ABILITY_1 || 
            _playerBuyStuffData.stuffType == Api.stuffTypeList.ABILITY_2 || 
            _playerBuyStuffData.stuffType == Api.stuffTypeList.ABILITY_3) {
            await _resourceClient.getInventoryItem(_token, _stuffSeq)
        }

        /** 구매 보상이 부스트 일시 ㅋㅋ;; */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.BOOST){
            await _resourceClient.getInventoryItem(_token, _stuffSeq)
        }


        /////////////////////////////// 뽑기 ////////////////////////////////



        /** 구매 보상이 보물 뽑기 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.DRAW_TREASURE){
            return await Util.sendError(_res, "뽑기 구현 안함")
        }

        /** 구매 보상이 펫 뽑기 */
        if(_playerBuyStuffData.stuffType == Api.stuffTypeList.DRAW_PET){
            return await Util.sendError(_res, "뽑기 구현 안함")
        }

        /** 구매 보상이 부스트 뽑기 */
        if(_playerBuyStuffData.stuffType == "SG"){
            //TODO 나중에 구현함 ㅇㅇ
            //저장은 안되지만 클라에서 쓸 수 있음 ㅇㅇ
        }


        const _db = await Database.conn();

        let _result: any = (await _db.collection("users").findOne({
            token: _token
        }))



        let _data = {
            "stuffSeq": _stuffSeq,
            "remainderGem": _result.data.userData.cashInfo.gem,
            "remainderCoin": _result.data.userData.cashInfo.coin,
            "todayPoint": _result.data.userData.cashInfo.pointResult.todayPoint,
            "currentPoint": _result.data.userData.cashInfo.pointResult.currentPoint,
            "todayHeartPoint": _result.data.userData.cashInfo.pointResult.todayHeartPoint,
            "todayWinPoint":  _result.data.userData.cashInfo.pointResult.todayWinPoint,
            "todayBragPoint":  _result.data.userData.cashInfo.pointResult.todayBragPoint,
            "giftCount": _result.data.userData.cashInfo.pointResult.giftCount,
            "updateDt": Date.now(),
            "keyCount": _result.data.userData.cashInfo.key,
            "keyRestoredTime": _result.data.userData.keyRestoredTime,
            "lifeCount": _result.data.userData.cashInfo.life,
            "lifeRestoredTime": _result.data.userData.lifeRestoredTime,
            "availableBuyKeyWithHeart": 5000,
            "cashInfo": {
                ..._result.data.userData.cashInfo,
            },
            "currentEpisodeSeq": _result.data.userData.currentEpisodeSeq,
            "normalQuestList": [],
            "unlockEpisodeQuestList": []
        }


        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _data
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);;


    }

    async logout(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {}
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);
    }




    ////////////////////////////////////////////////////////
    /////////////////////[TODO_LINE]////////////////////////
    ////////////////////////////////////////////////////////


    async getFriendComoboInfo(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {}
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getEpisodeDefaultMemberInfo(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {}
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getEpisodeLeagueMemberInfo(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken
        let _episodeSeq = Util.parsePacket(_req).episodeSeq

        let _data = {
            "episodeSeq": _episodeSeq,
            "lastLeagueStartDt": Date.now(),
            "leagueStatus": 2,
            "leagueRank": 0, /** 신 티어 */
            "leagueMemberInfoList": [
                // {"lv":71,"status":1,"memberSeq":4,"playCombination":{"cookie":"107000:8","cookie2":"106900:8","pet":"208100:8","treasure0":"13079100:10","treasure1":"1107100:10","treasure2":"1206800:10"},"currLeagueScore":124780752,"currLeagueRank":35,"allTimeHighScore":116036088,"allTimeHighRank":36,"nickname":"League 1"},
                // {"lv":51,"status":1,"memberSeq":1,"playCombination":{"cookie":"106900:8","cookie2":"106800:8","pet":"208000:8","treasure0":"13079100:10","treasure1":"1107100:10","treasure2":"1206800:10"},"currLeagueScore":34780752,"currLeagueRank":35,"allTimeHighScore":76036088,"allTimeHighRank":36,"nickname":"League 2"},
                // {"lv":31,"status":1,"memberSeq":2,"playCombination":{"cookie":"106800:8","cookie2":"106700:8","pet":"207900:8","treasure0":"13079100:10","treasure1":"1107100:10","treasure2":"1206800:10"},"currLeagueScore":204780752,"currLeagueRank":35,"allTimeHighScore":506036088,"allTimeHighRank":36,"nickname":"League 3"},
                // {"lv":22,"status":1,"memberSeq":3,"playCombination":{"cookie":"106700:8","cookie2":"106600:8","pet":"207800:8","treasure0":"13079100:10","treasure1":"1107100:10","treasure2":"1206800:10"},"currLeagueScore":104780752,"currLeagueRank":35,"allTimeHighScore":106036088,"allTimeHighRank":36,"nickname":"League 4"},
            ]
        }


        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _data
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getLeaguePlace(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {
                "leaguePlaceList": [
                    // { "place": 1, "episodeSeq": 1, "allTimeHighRank": 36, "leagueRank": 36 },
                    // { "place": 1, "episodeSeq": 2, "allTimeHighRank": 36, "leagueRank": 36 },
                    // { "place": 1, "episodeSeq": 3, "allTimeHighRank": 36, "leagueRank": 36 },
                    // { "place": 1, "episodeSeq": 4, "allTimeHighRank": 36, "leagueRank": 36 },
                    // { "place": 1, "episodeSeq": 5, "allTimeHighRank": 36, "leagueRank": 36 }
                ]
            }
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }

    async getLeagueResult(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: {}
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }




}