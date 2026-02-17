const Main = new NativeClass('Terraria', 'Main');
const Vector2 = new NativeClass('Microsoft.Xna.Framework', 'Vector2');

export class Rand {
    static get Instance() { return Main.rand; }
    
    static Next(a = 0, b) {
        return b === undefined ? Math.floor(Math.random() * a) : Math.floor(a + Math.random() * (b - a));
    }
    
    static NextInt(min = 0, max = 1) {
        return Math.floor(min + Math.random() * (max - min));
    }
    
    static NextFloat(min = 0, max = 1) {
        return min + Math.random() * (max - min);
    }
    
    static NextBool(value = 2) {
        return Math.random() < 1 / value;
    }
    
    static NextChance(value = 0.5) {
        return Math.random() < value;
    }
    
    static NextVector2Circular(rx, ry) {
        const a = Math.random() * Math.PI * 2;
        const v = Vector2.new();
        v.X = Math.cos(a) * rx; v.Y = Math.sin(a) * ry;
        return v;
    }
    
    static NextVector2Unit() {
        const a = Math.random() * Math.PI * 2;
        const v = Vector2.new();
        v.X = Math.cos(a); v.Y = Math.sin(a);
        return v;
    }
    
    static NextSign() {
        return Math.random() < 0.5 ? -1 : 1;
    }
    
    static NextFromList(arr) {
        return arr[Rand.Next(arr.length)];
    }
    
    // [[value1, weight], [value2, weight], ...];
    static NextFromListWeighted(arr) {
        let total = 0;
        for (let i = 0; i < arr.length; i++) total += arr[i][1];
        let r = Math.random() * total;
        for (let i = 0; i < arr.length; i++) {
            if ((r -= arr[i][1]) <= 0) return arr[i][0];
        }
    }
}