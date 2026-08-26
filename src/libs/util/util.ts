import { Util, Database } from "../";


/**
* 
* @param length Random Token Length
* @returns Return Random Token
*/
function getRandomToken(length : number) {

    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    let result = '';

    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
      return result;

}


/**
 * 
 * @param _Date new Date()
 * @returns Pretty time
 */
function getTime(_Date : Date) {

    let today = new Date(Number(_Date));

    let year = String(today.getFullYear()); 

    let month = String(today.getMonth() + 1); 

    let date = String(today.getDate()); 

    let hours = String(today.getHours()); 

    let minutes = String(today.getMinutes()); 

    let seconds = String(today.getSeconds()); 
    
    if(String(month).length < 2) month = "0" + month;

    if(String(date).length < 2) date = "0" + date;

    if(String(hours).length < 2) hours = "0" + hours;

    if(String(minutes).length < 2) minutes = "0" + minutes;

    if(String(seconds).length < 2) seconds = "0" + seconds;

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

}

/**
 * 
 * @param text Console text what you want
 * @param type Type for pretty console log
 */
function printConsole(text : string, type : Util.consoleType){

    if(type == "alert") console.log("\x1b[36m%s\x1b[32m%s\x1b[37m%s",`[${getTime(new Date)}] `, `[INFO] `, `${text}`);

    if(type == "error") console.log("\x1b[36m%s\x1b[31m%s\x1b[37m%s",`[${getTime(new Date)}] `,  `[ERROR] `, `${text}`);

    if(type == "warning") console.log("\x1b[36m%s\x1b[33m%s\x1b[37m%s",`[${getTime(new Date)}] `, `[WARNING] `, `${text}`);
    
  }

/**
 * 
 * @returns print to console access log
 */
const logger = () => (req : any, res : any, next : Function) => {
    printConsole(`${req.connection.remoteAddress.split("::ffff:")[1]} - ${req.method} | ${res.statusCode} | PATH : ${req.url}`, "alert");
    next();
}

export { 
    printConsole, 
    getTime,
    logger,
    getRandomToken,
}