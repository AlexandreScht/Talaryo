"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SearchFolderModel", {
    enumerable: true,
    get: function() {
        return SearchFolderModel;
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
let SearchFolderModel = class SearchFolderModel extends _objection.Model {
    constructor(...args){
        super(...args);
        _define_property(this, "id", void 0);
        _define_property(this, "userId", void 0);
        _define_property(this, "name", void 0);
        _define_property(this, "count", void 0);
    }
};
_define_property(SearchFolderModel, "tableName", 'searchFolders');
_define_property(SearchFolderModel, "idColumn", 'id');
_define_property(SearchFolderModel, "modifiers", {
    paginate: (query, limit, page)=>query.limit(limit).offset((page - 1) * limit)
});

//# sourceMappingURL=searchFolders.js.map