import { Terraria } from './ModImports.js';
/**
 * This class allows you to change proj.ai and proj.localAI
 * Usage example:
 * ```js
 * // false = proj.ai / true = proj.localAI
 * const ai = new ProjAI(proj, false);
 * ai[0]++
 * if (ai[0] > 60) {
 *     ai[0] = 0;
 *     ai[1] += 1;
 * }
 * proj.scale = 1 + ai[1];
 * ```
*/
export class ProjAI {
    constructor(proj, local = false) {
        this.proj = proj;
        this.ai = local ? 'localAI' : 'ai';
    }
    
    get 0() {
        return this.proj[this.ai].get_Item(0);
    }
    set 0(value) {
        let v = this.proj[this.ai];
        v.val0 = value;
        this.proj[this.ai] = v;
    }
    
    get 1() {
        return this.proj[this.ai].get_Item(1);
    }
    set 1(value) {
        let v = this.proj[this.ai];
        v.val1 = value;
        this.proj[this.ai] = v;
    }
    
    get 2() {
        return this.proj[this.ai].get_Item(2);
    }
    set 2(value) {
        let v = this.proj[this.ai];
        v.val2 = value;
        this.proj[this.ai] = v;
    }
}