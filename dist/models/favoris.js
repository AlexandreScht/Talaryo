"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FavoriModel", {
    enumerable: true,
    get: function() {
        return FavoriModel;
    }
});
const _objection = require("objection");
const _favFolders = require("./favFolders");
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
let FavoriModel = class FavoriModel extends _objection.Model {
    static get relationMappings() {
        return {
            folder: {
                relation: _objection.Model.BelongsToOneRelation,
                modelClass: _favFolders.FavFoldersModel,
                join: {
                    from: 'favoris.favFolderId',
                    to: 'favFolders.id'
                }
            }
        };
    }
    constructor(...args){
        super(...args);
        _define_property(this, "id", void 0);
        _define_property(this, "userId", void 0);
        _define_property(this, "link", void 0);
        _define_property(this, "desc", void 0);
        _define_property(this, "img", void 0);
        _define_property(this, "fullName", void 0);
        _define_property(this, "currentJob", void 0);
        _define_property(this, "currentCompany", void 0);
        _define_property(this, "disabled", void 0);
        _define_property(this, "favFolderId", void 0);
        _define_property(this, "count", void 0);
    }
};
_define_property(FavoriModel, "tableName", 'favoris');
_define_property(FavoriModel, "idColumn", 'id');
_define_property(FavoriModel, "modifiers", {
    paginate: (query, limit, page)=>query.limit(limit).offset((page - 1) * limit)
});

//# sourceMappingURL=favoris.js.map