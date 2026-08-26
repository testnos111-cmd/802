import express from 'express'
import { printConsole } from '../util'
import { Util } from '..'

export const asyncHandler = (requestHandler : Function) => {
    return async (_req : express.Request, _res : express.Response, _next : Function) => {
        try {
            await (requestHandler(_req, _res, _next))
        }  catch(err) {
            err.stack.split("\n").forEach(x=>{
                printConsole(x, "error");
            })
            Util.sendPacket(_res, {}, 503, "ERROR")
        }
        
    }
}