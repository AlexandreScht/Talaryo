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
const _exceptions = require("../exceptions");
const _favoris = require("../models/favoris");
const _objection = require("objection");
const _typedi = require("typedi");
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let FavorisServiceFile = class FavorisServiceFile {
    get getModel() {
        return _favoris.FavoriModel.knex();
    }
    // ! A refaire
    async findAllUserFav(id, objects) {
        try {
            const links = [
                ...new Set(objects.map((obj)=>obj.link))
            ];
            const favorites = await _favoris.FavoriModel.query().where({
                userId: id
            }).whereIn('link', links).select('link', 'favFolderId');
            return new Map(favorites.map((fav)=>[
                    fav.link,
                    fav.favFolderId
                ]));
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
    }
    async getFavInFolder(limit, page, favFolderId) {
        try {
            const query = _favoris.FavoriModel.query().where({
                favFolderId,
                disabled: false
            });
            const [{ count }] = await query.clone().limit(1).offset(0).count();
            const total = Number.parseInt(count, 10);
            const favoris = await query.modify('paginate', limit, page);
            return {
                total,
                favoris
            };
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
    }
    async getLastFav(userId) {
        try {
            return await _favoris.FavoriModel.query().where({
                userId,
                disabled: false
            }).orderBy('id', 'desc').limit(3);
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
    }
    async createFav(fav, id) {
        try {
            return await _favoris.FavoriModel.query().insert(_object_spread_props(_object_spread({}, fav), {
                userId: id
            }));
        } catch (error) {
            if (error instanceof _objection.ConstraintViolationError) {
                return false;
            }
            throw new _exceptions.ServicesError();
        }
    }
    async removeFav({ favFolderId, link }) {
        try {
            const deletedRows = await _favoris.FavoriModel.query().delete().where({
                favFolderId,
                link
            });
            return !isNaN(deletedRows) && deletedRows > 0;
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
    }
};
FavorisServiceFile = _ts_decorate([
    (0, _typedi.Service)()
], FavorisServiceFile);
const _default = FavorisServiceFile;

//# sourceMappingURL=favoris.js.map