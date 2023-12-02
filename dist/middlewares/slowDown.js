"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const slowDown = (ms)=>({ next })=>setTimeout(()=>next(), ms);
const _default = slowDown;

//# sourceMappingURL=slowDown.js.map