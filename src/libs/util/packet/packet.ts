import { Crypto, Util } from "../..";
import * as express from 'express'

const _Crypto = new Crypto.Crypto

/**
 * 
 * @param _res Express response 
 * @param _body Packet body
 * @param _status Status code for client
 * @param _message Message for client
 */
export function sendPacket(_res : express.Response, _body : object, _status : number, _message : string) {

    let _encryptedBody = _Crypto.encryptPacket(JSON.stringify(_body));

    let _returnPacket : Util.requestPacketBody = {
        responseCode : _status,
        responseData : _encryptedBody,
        responseMessage : _message,
        responseVersion : 1
    }

    //console.log(_returnPacket)

    _res.type("application/json").send(JSON.stringify(_returnPacket));

    return _returnPacket;

}

export function sendError(_res : express.Response, _message : string) {
    let _encryptedBody = _Crypto.encryptPacket(JSON.stringify({}));

    let _returnPacket : Util.requestPacketBody = {
        responseCode : 503,
        responseData : _encryptedBody,
        responseMessage : _message,
        responseVersion : 1
    }

    //console.log(_returnPacket)

    _res.type("application/json").send(JSON.stringify(_returnPacket));

    return _returnPacket;
}

export function parsePacket(_req : express.Request) {

    let _decryptedBody = _Crypto.decryptPacket(_req.body.data)

    //console.log(_decryptedBody)

    return JSON.parse(_decryptedBody);
    
}