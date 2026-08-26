import { Database, Util } from "../..";


export async function setLifeFive() {

    const _db = await Database.conn()

    var _userList = await _db.collection("users").find({
        "data.userData.cashInfo.life" : { $lt : 5 } 
    }).toArray()


    await _db.collection("users").updateMany({
        "data.userData.cashInfo.life" : { $lt : 5 }
    }, {
        $set : {
        "data.userData.cashInfo.life" : 5
        }
    })

    Util.printConsole(`${_userList.length}명의 플레이어의 생명을 5로 수정했습니다.`, "alert")

}




export async function setKeyThree() {

    const _db = await Database.conn();

    var _userList = await _db.collection("users").find({
        "data.userData.cashInfo.key" : { $lt : 3 } 
    }).toArray()


    await _db.collection("users").updateMany({
        "data.userData.cashInfo.key" : { $lt : 3 }
    }, {
        $set : {
        "data.userData.cashInfo.key" : 3
        }
    })

    Util.printConsole(`${_userList.length}명의 플레이어의 열쇠를 3으로 수정했습니다.`, "alert")

}

