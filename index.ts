import express from 'express';
import { Util } from './src/libs';
var serverOption = {
    port: Number(process.env.PORT || 80),
    host: '0.0.0.0'
}

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(Util.logger())

/* get template from "./views" folder */
app.set('views', './views');
app.set('view engine', 'ejs');          

/* Get main router */
import { main } from './src/files/main'; app.use("/", main);
/* Get api router */
import { api } from './src/files/api'; app.use("/v1", api);
/* Get game router */
import { game } from './src/files/game'; app.use("/", game); app.use("//", game);
/* Get playGame router */
import { play } from './src/files/play'; app.use("/", play); app.use("//", play);

/* Set static dir for user */
app.use("/download", express.static('./src/asset/download'))
app.use("/sdks", express.static('./src/asset/sdks'))
app.use("/static", express.static('./src/static'))

/* process Error */
app.use(function(err : Error, req : express.Request, res : express.Response, next : Function) {
    console.error(err.stack);
    res
      .status(500)
      .send(`Error occured`);
  });



/* Legacy compatibility fallback: old 8.0.x clients have a much larger API surface.
 * For unimplemented non-token .ds handshake calls, return the normal encrypted
 * COMPLETE packet instead of terminating the connection. Token-protected routes
 * remain handled by their real handlers above. */
app.post("*", (req: express.Request, res: express.Response, next: Function)=>{
    const p = String(req.path || "");
    if (p.endsWith(".ds") && !p.includes("/member/") && !p.includes("/shop/") && !p.includes("/game/") && !p.includes("/push/")) {
        try {
            Util.sendPacket(res, {}, 200, "COMPLETE");
            return;
        } catch (_) {}
    }
    next();
});

/* process Not Found */
app.get("*", (req : express.Request , res : express.Response)=>{
	res
    .status(404)
    .send(`Not found`)
    Util.printConsole(`${req.method} | ${res.statusCode} | PATH : ${req.url}`, "warning")
})

app.post("*", (req : express.Request , res : express.Response)=>{
	res
    .status(404)
    .send(`Not found`)
    Util.printConsole(`${req.method} | ${res.statusCode} | PATH : ${req.url}`, "warning")
})



/* Run Server */
app.listen(serverOption.port, serverOption.host, async ()=>{
    Util.printConsole(`SERVER LISTING ON ${serverOption.port}`, "alert"); 

    /** START SCRIPT */

    Util.printConsole(`START OPENING PROCESS!`, "alert")
    await Util.setLifeFive() 
    await Util.setKeyThree() 

})




