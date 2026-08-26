import * as fs from 'fs'

/**
 * 
 * @param _dir 
 * @param _data 
 * @returns 
 */
export async function setAsset(_dir : string, _data : object) {
    try {
        fs.writeFileSync("./"+_dir+".json", JSON.stringify(_data, null, 3));
        return 0;
    } catch (error) {
        throw error;
    }
}


/**
 * 
 * @param _dir 
 * @returns 
 */
export function getAsset(_dir : string) {
    try {
        let _data = fs.readFileSync("./"+_dir+".json");
        return JSON.parse(String(_data)); 
    } catch (error) {
        throw error;
    }
}
