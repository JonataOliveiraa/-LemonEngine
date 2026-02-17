export class BinarySerializer {
    static encode(obj) {
        const bytes = [];
        for (const [key, value] of Object.entries(obj)) {
            const keyBytes = this.strToBytes(key);
            bytes.push(keyBytes.length, ...keyBytes);

            if (typeof value === 'number') {
                bytes.push(1, ...this.float64ToBytes(value));
            } else if (typeof value === 'boolean') {
                bytes.push(2, value ? 1 : 0);
            } else if (typeof value === 'string') {
                const valBytes = this.strToBytes(value);
                bytes.push(3, valBytes.length, ...valBytes);
            } else if (value === null) {
                bytes.push(4);
            } else {
                //throw new Error('Unsupported type: ' + typeof value);
                return new Uint8Array();
            }
        }
        return new Uint8Array(bytes);
    }

    static decode(arr) {
        const obj = {};
        let i = 0;
        while (i < arr.length) {
            const keyLen = arr[i++];
            const key = this.bytesToStr(arr.slice(i, i + keyLen));
            i += keyLen;

            const type = arr[i++];
            let value;
            switch (type) {
                case 1:
                    value = this.bytesToFloat64(arr.slice(i, i + 8));
                    i += 8;
                    break;
                case 2:
                    value = !!arr[i++];
                    break;
                case 3:
                    const strLen = arr[i++];
                    value = this.bytesToStr(arr.slice(i, i + strLen));
                    i += strLen;
                    break;
                case 4:
                    value = null;
                    break;
                default:
                    //throw new Error('Unknown type ' + type);
                    value = null;
            }
            obj[key] = value;
        }
        return obj;
    }

    static strToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code < 0x80) bytes.push(code);
            else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
            else bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        }
        return bytes;
    }

    static bytesToStr(bytes) {
        let out = '', i = 0;
        while (i < bytes.length) {
            const b1 = bytes[i++];
            if (b1 < 0x80) out += String.fromCharCode(b1);
            else if (b1 < 0xe0) out += String.fromCharCode(((b1 & 0x1f) << 6) | (bytes[i++] & 0x3f));
            else out += String.fromCharCode(((b1 & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
        }
        return out;
    }

    static float64ToBytes(num) {
        const buf = new ArrayBuffer(8);
        new DataView(buf).setFloat64(0, num, true);
        return Array.from(new Uint8Array(buf));
    }

    static bytesToFloat64(bytes) {
        const buf = new ArrayBuffer(8);
        new Uint8Array(buf).set(bytes);
        return new DataView(buf).getFloat64(0, true);
    }
}