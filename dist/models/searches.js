"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SearchesModel", {
    enumerable: true,
    get: function() {
        return SearchesModel;
    }
});
const _objection = require("objection");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
let SearchesModel = class SearchesModel extends _objection.Model {
    constructor(...args){
        super(...args);
        _define_property(this, "id", void 0);
        _define_property(this, "userId", void 0);
        _define_property(this, "searchFolderId", void 0);
        _define_property(this, "search", void 0);
        _define_property(this, "count", void 0);
    }
};
_define_property(SearchesModel, "tableName", 'searches');
_define_property(SearchesModel, "idColumn", 'id');
_define_property(SearchesModel, "modifiers", {
    paginate: (query, limit, page)=>query.limit(limit).offset((page - 1) * limit)
});

//# sourceMappingURL=searches.js.map