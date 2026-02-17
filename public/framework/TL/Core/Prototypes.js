import { System } from './../ModImports.js';

export class Prototypes {
    static Initialize() {
        Uint8Array.prototype.makeGeneric = function(Type) {
            if (typeof Type === 'string') {
                Type = Prototypes._getTypeByName(Type);
                if (!Type) return this;
            }
            const list = System.Collections.Generic.List.makeGeneric(Type).new();
            list['void .ctor()']();
            for (let i = 0; i < this.length; i++) {
                list.Add(this[i]);
            }
            return list.ToArray();
        }
        
        Array.prototype.makeGeneric = function(Type) {
            if (typeof Type === 'string') {
                Type = Prototypes._getTypeByName(Type);
                if (!Type) return this;
            }
            const list = System.Collections.Generic.List.makeGeneric(Type).new();
            list['void .ctor()']();
            for (let i = 0; i < this.length; i++) {
                list.Add(this[i]);
            }
            return list.ToArray();
        }
    }
    
    static _getTypeByName(name) {
        name = name.toLowerCase();
        let Type = null;
        switch (name) {
            case 'bool':
                Type = System.Boolean;
                break;
            case 'byte':
                Type = System.Byte;
                break;
            case 'int':
                Type = System.Int32;
                break;
            case 'float':
                Type = System.Single;
                break;
            case 'string':
                Type = System.String;
                break
        }
        return Type;
    }
}