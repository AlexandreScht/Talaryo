"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FavFoldersModel", {
    enumerable: true,
    get: function() {
        return FavFoldersModel;
    }
});
const _objection = require("objection");
const _favoris = require("./favoris");
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
let FavFoldersModel = class FavFoldersModel extends _objection.Model {
    static get relationMappings() {
        return {
            favoris: {
                relation: _objection.Model.HasManyRelation,
                modelClass: _favoris.FavoriModel,
                join: {
                    from: 'favFolders.id',
                    to: 'favoris.favFolderId'
                },
                modify: (query)=>{
                    query.where({
                        disabled: false
                    }).select('id');
                }
            }
        };
    }
    constructor(...args){
        super(...args);
        _define_property(this, "id", void 0);
        _define_property(this, "userId", void 0);
        _define_property(this, "name", void 0);
        _define_property(this, "count", void 0);
    }
};
_define_property(FavFoldersModel, "tableName", 'favFolders');
_define_property(FavFoldersModel, "idColumn", 'id');
_define_property(FavFoldersModel, "modifiers", {
    paginate: (query, limit, page)=>query.limit(limit).offset((page - 1) * limit)
});

//# sourceMappingURL=favFolders.js.map