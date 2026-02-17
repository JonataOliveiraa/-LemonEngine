import { Microsoft } from './../ModImports.js';

export class Color {
    static new(R = 255, G = 255, B = 255, A = 255) {
        const c = Microsoft.Xna.Framework.Graphics.Color.new();
        c['void .ctor(int r, int g, int b, int a)'](R, G, B, A);
        return c;
    }
    
    static getByName(name) {
        return Microsoft.Xna.Framework.Graphics.Color[name] ?? Color.new(0, 0, 0, 0);
    }
    
    constructor(R = 255, G = 255, B = 255, A = 255) {
        this._r = R;
        this._g = G;
        this._b = B;
        this._a = A;
        this._value = Color.new(R, G, B, A);
    }
    
    get R() { return this._r; }
    set R(value) {
        this._r = value;
        this._value.R = value;
    }
    
    get G() { return this._g; }
    set G(value) {
        this._g = value;
        this._value.G = value;
    }
    
    get B() { return this._b; }
    set B(value) {
        this._b = value;
        this._value.B = value;
    }
    
    get A() { return this._a; }
    set A(value) {
        this._a = value;
        this._value.A = value;
    }
    
    get Value() { return this._value; }
    set Value(value) {
        this._value = value;
        this._r = value.R;
        this._g = value.G;
        this._b = value.B;
        this._a = value.A;
    }
    
    op_Multiply(amount) {
        this.Value = Microsoft.Xna.Framework.Graphics.Color[
        'Color op_Multiply(Color a, float amount)'
        ](this.Value, amount);
    }
    
    Multiply(amount) {
        this.Value = Microsoft.Xna.Framework.Graphics.Color[
        'Color Multiply(Color a, float amount)'
        ](this.Value, amount);
    }
    
    Lerp(color, amount) {
        this.Value = Microsoft.Xna.Framework.Graphics.Color[
        'Color Lerp(Color value1, Color value2, float amount)'
        ](this.Value, color, amount);
    }
    
    static op_Multiply(color, amount) {
        return Microsoft.Xna.Framework.Graphics.Color[
        'Color op_Multiply(Color a, float amount)'
        ](color, amount);
    }
    
    static Multiply(color, amount) {
        return Microsoft.Xna.Framework.Graphics.Color[
        'Color Multiply(Color a, float amount)'
        ](color, amount);
    }
    
    static Lerp(color1, color2, amount) {
        return Microsoft.Xna.Framework.Graphics.Color[
        'Color Lerp(Color value1, Color value2, float amount)'
        ](color1, color2, amount);
    }
}