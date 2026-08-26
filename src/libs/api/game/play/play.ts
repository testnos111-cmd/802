import { Database, Api, Util, Client } from "../../..";
import { ManageResources } from "../data";
import express from 'express'

/** 
 * Check user life key
 * This function have benefit reduce cheat user
 * */
let gamePlayList : Api.gamePlayList = {}

export class GamePlayClient {

    /** Process game start pakcet */
    async episodeBeforePlay(_req: express.Request, _res: express.Response) {

        const _ResourceClient = new Api.ManageResources;
        const _DataClient = new Api.GameDataClient;

        const _db = await Database.conn();

        let _token: string = Util.parsePacket(_req).accessToken
        let _body: any = Util.parsePacket(_req)

        let _lifeKey = Util.getRandomToken(10)

        gamePlayList[_token] = {
            lifeKey : _lifeKey,
            startTime : Date.now()
        }

        /** Set config for client  */
        var _data: object = {
            "lifeKey": _lifeKey,
            "treasureBoxList": [
                ...Util.getTreasureBox(999)
            ]
        }


        const _userData = await Util.getMemberInfo(_token);


        if (!_userData.success) {
            return Util.sendError(_res, "userInfo error"); /** When, user is not exist -> return error */
        }

        /** If player play special episode, reduce key instead of life */
        if (_body.episodeSeq == Api.specialEpisode.COIN_ISLAND || _body.episodeSeq == Api.specialEpisode.ICE_WAVE_TOWER) {

            let _keyCount = _userData.data.data.userData.cashInfo.key

            /** When key is smaller than zero, return error */
            if (_keyCount < 1) {
                return Util.sendError(_res, "lack key")
            }

            /** 
             * Call use key function
             * The function have auto charge function too...
             */
            await _ResourceClient.useKey(_token, 1)

        } else { /** Common episode use life for game */

            let _lifeCount = _userData.data.data.userData.cashInfo.life

            /** When life count smaller than one, return error */
            if (_lifeCount < 1) { 
                return Util.sendError(_res, "lack life")
            }

            /**
             * Call use life function
             * This function also have auto charge function
             */
            await _ResourceClient.useLife(_token, 1);

        }

        await _DataClient.changeEpisodeData(_token, _body.episodeSeq);

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _data
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);
    }


    /** Process after game play */
    async episodeAfterPlay(_req: express.Request, _res: express.Response) {

        let _token: string = Util.parsePacket(_req).accessToken
        let _body: any = Util.parsePacket(_req)

        /** Check vaild play  */
        if(!(gamePlayList[_token]?.lifeKey && gamePlayList[_token]?.lifeKey == _body.lifeKey)){
            return Util.sendError(_res , "not allowed lifeKey")
        }

        /** Delete used @var lifeKey in object */
        delete gamePlayList[_token]

        /** Get resource client */
        const _ResourceClient = new Api.ManageResources

        /** Add coins as the player earns coins */
        await _ResourceClient.getCoin(_token, Number(_body.earnedCoin))

        /** Add Exps as the player earns coins */
        await _ResourceClient.getExp(_token, Number(_body.earnedExp))

        /** Use booster player used */
        _body.boosterList.forEach(async (x: any) => {
            await _ResourceClient.useInventoryItem(_token, x.stuffSeq);
        })

        /** Save score */

        await Util.saveScore(_token, _body);

        var _data: object = {
            "treasureBoxResultList": []
        }

        let _returnData: Api.returnData = {
            status: 200,
            message: "COMPLETE",
            data: _data
        }

        return Util.sendPacket(_res, _returnData.data, _returnData.status, _returnData.message);

    }


}