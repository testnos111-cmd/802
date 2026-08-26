import * as express from 'express'
import { Database } from '../libs';
const router = express.Router();

let main = router;
export { main }

router
.get("/", (req : express.Request, res : express.Response)=>{
    res.send("Server is running")
})


.get("/clear", async (req : express.Request, res : express.Response)=>{
    const db = await Database.conn();
    await db.collection("users").deleteMany({});
    res.send("done.")
})

.get("/list", async (req : express.Request, res : express.Response)=>{
    const db = await Database.conn();
    let result = await db.collection("users").find({}).toArray();

    let arr = [];
    
    result.forEach(x=>{
        arr.push(`${x.token} | ${x.data.userData.nickname} => ${x.data.userData.ip}`);
    })

    res.send(arr.join("<br>"));
})

