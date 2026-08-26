export class Crypto {

    /* OLD_KEY : dev!Wkwkdwhgdk!sisters@#$ */
    public _key : string = "abf!wkwkdwhgdk!slsters@#$";

    /**
     * 
     * @param arg encrypted packet body
     * @returns decrypted kcr packet body
     */

    decryptPacket(arg : string){
        const cipherBuffer = Buffer.from(arg, "base64");
        let decipherBytes = [];
      
        let cnt = 0;
        for (let i = 0; i < cipherBuffer.length; i++) {
            decipherBytes.push(cipherBuffer[i] ^ this._key.charCodeAt(cnt));
            cnt = (cnt + 1) % this._key.length;
        }
      
        const decoder = new TextDecoder();

        /* Byte Array To String */
        const decipher = decoder.decode(new Uint8Array(decipherBytes));

        return decipher;
    }

    /**
     * 
     * @param arg raw packet body
     * @returns encrypted kcr packet body
     */

    encryptPacket(arg : string){
        const encoder = new TextEncoder();

        /* String To Byte Array */
        const decipherBytes = encoder.encode(arg);
      
        let cipher = "";
        let cnt = 0;
      
        for (let i = 0; i < decipherBytes.length; i++) {
            cipher += String.fromCharCode(decipherBytes[i] ^ this._key.charCodeAt(cnt));
            cnt = (cnt + 1) % this._key.length;
        }
      
        var cipherBuffer = Buffer.from(cipher, "ascii");
        var base64Cipher = cipherBuffer.toString("base64");
        base64Cipher = base64Cipher.replace(/\+/gi, "-").replace(/\//gi, "_") //.replace(/\=/gi,"");
        return base64Cipher;
    }
}

