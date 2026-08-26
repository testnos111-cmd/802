import { Database, Api } from "../.."
import { playHistory, playInfoList } from "../../api";

async function getFriend(_token : string, _arr? : Array<number>) : Promise<Array<any>> {
    const _db = await Database.conn()
    if(!_arr) {
        let _data = await _db.collection('users').find({ token : { $ne : _token } }).toArray()
        return _data
    } else {
        let _data = await _db.collection('users').find({ 
            token : { $ne : _token },
            "data.userData.memberSeq" : { $in : _arr }
          }).toArray()
        return _data;
    }

    
}

async function getScore(_userData : Api.playerData, _episodeSeq : number) : Promise<playInfoList>{

    let _result : any;

    _userData.data.userData.episodePlayInfoList.forEach((x : Api.playInfoList, i : number)=>{
        if(x.episodeSeq == _episodeSeq) {
            _result = _userData.data.userData.episodePlayInfoList[i]
            return false;
        }
    })

    return _result;
}

function getTreasureBox(_count : number) {
    let _arr : Array<object> = []

    for(let i=0; i<=_count; i++){
        _arr.push({"stuffSeq":700234,"causeSeq":0}) //TODO
    }

    return _arr
    
}

async function saveScore(_token : string, _body : any) {
    const _db = await Database.conn()

    let _result : any = await _db.collection("users").findOne({ token : _token });
    let _lastHighScore : any = (await this.getScore(_result, _body.episodeSeq)).alltimeHighPlayHistory.score

    let _newHistory : Api.playHistory= {
        userLevel : _result.data.userData.levelData.lv,
        score : _body.score,
        cookie : _body.cookie,
        cookie2 : _body.cookie2,
        pet : _body.pet,
        treasure0 : _body.treasure0,
        treasure1 : _body.treasure1,
        treasure2 : _body.treasure2,
    }

    if(_lastHighScore < _body.score){
        _db.collection("users").updateOne({ 
            token : _token, 
            "data.userData.episodePlayInfoList.episodeSeq" : _body.episodeSeq
        }, {
            $set : {
                "data.userData.episodePlayInfoList.$.playHistory" : _newHistory,
                "data.userData.episodePlayInfoList.$.lastPlayHistory" : _newHistory,
                "data.userData.episodePlayInfoList.$.alltimeHighPlayHistory" : _newHistory
            }
        })
    } else {
        _db.collection("users").updateOne({
            token : _token,
            "data.userData.episodePlayInfoList.episodeSeq" : _body.episodeSeq
         }, {
            $set : {
                "data.userData.episodePlayInfoList.$.lastPlayHistory" : _newHistory,
            }
         })
    }
    
}

async function getMemberInfo(_token : string) {
    const _db = await Database.conn();

    let _data = await _db.collection("users").findOne({
        token : _token,
    })

    if(_data) {
        return { success : true, data : _data }
    } else {
        return { success : false }
    }
}


export { 
    getFriend, 
    getScore, 
    getTreasureBox,
    saveScore,
    getMemberInfo
}