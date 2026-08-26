import * as express from 'express'
import { Client } from '../libs'
const router = express.Router();

let api = router;
export { api }

const libs = new Client.Client

router.get("/users/me.json", libs.ApiClient.checkApiToken , async (req : express.Request, res : express.Response, next : Function)=>{
    var result = await libs.ApiClient.getMyInfo(String(req.query.access_token));
    if(result.status == 0){
        res.send(result.data);
    } else {
        next();
    }
})

router.get("/friends.json", libs.ApiClient.checkApiToken, async (req : express.Request, res : express.Response, next : Function)=>{
    var result = await libs.ApiClient.getFrinedsInfo(String(req.query.access_token))
    res.json(result.data)
})

router.use("/join.json", async (req : express.Request, res : express.Response, next : Function)=>{
    var result = await libs.ApiClient.joinUser(req);
    if(result.status == 0) {
        res.json(result);
    }
})

router.use("/login.json", libs.ApiClient.checkApiToken, async (req : express.Request, res : express.Response, next : Function)=>{
    var result = await libs.ApiClient.loginUser(String(req.query.access_token));
    if(result.status == 0) {
        const out: any = result;
        if (out && out.data) {
            out.data.refresh_token = String(req.query.access_token);
            out.data.expires_in = 315360000;
        }
        res.json(out);
    } else {
        next();
    }
})
router.use("/accounts/logout.json", libs.ApiClient.checkApiToken, async (req : express.Request, res : express.Response, next : Function)=>{
    res.json({
        "status": 0
      })
})

