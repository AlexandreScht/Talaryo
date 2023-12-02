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
const _regionLoc = require("../utils/regionLoc");
function serializeLoc(loc, zone) {
    const codeLoc = loc.substring(1, 3);
    const region = !zone ? _regionLoc.regionCode[codeLoc].toLowerCase() : _regionLoc.regionLoc[codeLoc].toLowerCase();
    return `"${!zone ? '*' : loc.split(':')[1].toLowerCase()},${region}"`;
}
const _default = serializeLoc;

//# sourceMappingURL=serializeLoc.js.map