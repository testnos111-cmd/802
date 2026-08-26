import express from 'express';
import { Util } from './src/libs';
var serverOption = {
    port: Number(process.env.PORT || 80),
    host: '0.0.0.0'
}

const app = express()
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Maximum diagnostic HTTP logger. It records request/response sequence, headers,
// query/body, status, response headers, byte counts, duration and exceptions.
// Raw bodies are written to logs/http.ndjson for offline packet comparison.
import fs from 'fs';
import path from 'path';

const debugLogDir = path.resolve('./logs');
fs.mkdirSync(debugLogDir, { recursive: true });
const debugLogFile = path.join(debugLogDir, 'http.ndjson');
let debugSeq = 0;

function safeJson(value: any) {
  try { return JSON.parse(JSON.stringify(value)); } catch (_) { return String(value); }
}
function appendDebug(event: any) {
  try { fs.appendFileSync(debugLogFile, JSON.stringify(event) + '\n'); } catch (_) {}
  try { console.log('[HTTPDBG] ' + JSON.stringify(event)); } catch (_) {}
}

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id = ++debugSeq;
  const started = process.hrtime.bigint();
  const chunks: Buffer[] = [];
  let captured = 0;
  const MAX_CAPTURE = 262144;
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  const originalSend = (res as any).send?.bind(res);
  const originalJson = (res as any).json?.bind(res);

  const capture = (chunk: any) => {
    if (chunk == null || captured >= MAX_CAPTURE) return;
    const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    const take = Math.min(b.length, MAX_CAPTURE - captured);
    chunks.push(b.subarray(0, take));
    captured += take;
  };

  (res as any).write = (chunk: any, encoding?: any) => { capture(chunk); return originalWrite(chunk, encoding); };
  (res as any).end = (chunk?: any, encoding?: any, cb?: any) => {
    if (chunk) capture(chunk);
    return originalEnd(chunk, encoding, cb);
  };
  if (originalSend) (res as any).send = (body: any) => { capture(body); return originalSend(body); };
  if (originalJson) (res as any).json = (body: any) => { capture(JSON.stringify(body)); return originalJson(body); };

  const requestEvent = {
    type: 'request', id, timestamp: new Date().toISOString(), method: req.method,
    url: req.originalUrl, path: req.path, query: safeJson(req.query),
    ip: req.ip, ips: req.ips,
    headers: { ...req.headers },
    body: req.body,
  };
  appendDebug(requestEvent);

  res.once('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
    const body = Buffer.concat(chunks);
    const ct = String(res.getHeader('content-type') || '');
    const entry = {
      type: 'response', id, timestamp: new Date().toISOString(), method: req.method,
      url: req.originalUrl, status: res.statusCode, statusMessage: res.statusMessage,
      durationMs: Number(elapsedMs.toFixed(3)), responseBytes: body.length,
      responseHeaders: res.getHeaders(), contentType: ct,
      responseUtf8: body.length <= 262144 ? body.toString('utf8') : body.subarray(0,262144).toString('utf8'),
      responseBase64: body.length <= 262144 ? body.toString('base64') : body.subarray(0,262144).toString('base64'),
      responseTruncated: body.length > 262144,
    };
    appendDebug(entry);
    if (res.statusCode >= 400) console.error('[HTTPERR]', JSON.stringify(entry));
  });

  res.once('close', () => {
    if (!res.writableEnded) appendDebug({ type:'aborted', id, timestamp:new Date().toISOString(), url:req.originalUrl, status:res.statusCode });
  });
  next();
});

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

/* Socket-level diagnostics: distinguish client-side cancellation from server-side errors. */
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const socket = req.socket;
  const remote = `${socket.remoteAddress || ''}:${socket.remotePort || ''}`;
  const started = process.hrtime.bigint();
  socket.on('close', (hadError) => {
    appendDebug({ type:'socketClose', timestamp:new Date().toISOString(), method:req.method, url:req.originalUrl, remote, hadError, responseEnded:res.writableEnded, responseStatus:res.statusCode, durationMs:Number((Number(process.hrtime.bigint()-started)/1e6).toFixed(3)) });
  });
  req.on('aborted', () => appendDebug({type:'requestAborted', timestamp:new Date().toISOString(), method:req.method, url:req.originalUrl, remote}));
  next();
});

/* process Error */
app.use(function(err : Error, req : express.Request, res : express.Response, next : Function) {
    console.error(err.stack);
    res
      .status(500)
      .send(`Error occured`);
  });



// Older clients may address CDN-derived files beneath /index. Keep the route local
// so the request is visible in diagnostics rather than escaping to an external host.
app.use("/index", express.static('./src/asset/index', { fallthrough: true, index: false }));
app.use("/file", express.static('./src/asset/file', { fallthrough: true, index: false }));
app.use("/asset", express.static('./src/asset', { fallthrough: true, index: false }));

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



process.on('uncaughtException', (err) => {
  appendDebug({ type: 'uncaughtException', timestamp: new Date().toISOString(), message: err.message, stack: err.stack });
});
process.on('unhandledRejection', (reason: any) => {
  appendDebug({ type: 'unhandledRejection', timestamp: new Date().toISOString(), reason: String(reason), stack: reason?.stack });
});

/* Run Server */
app.listen(serverOption.port, serverOption.host, async ()=>{
    Util.printConsole(`SERVER LISTING ON ${serverOption.port}`, "alert"); 

    /** START SCRIPT */

    Util.printConsole(`START OPENING PROCESS!`, "alert")
    await Util.setLifeFive() 
    await Util.setKeyThree() 

})




