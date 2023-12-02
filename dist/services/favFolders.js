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
const _favFolders = require("../models/favFolders");
const _favoris = require("../models/favoris");
const _objection = require("objection");
const _typedi = require("typedi");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let FavorisFolderFile = class FavorisFolderFile {
    get getModel() {
        return _favFolders.FavFoldersModel.knex();
    }
    async createFolder(name, userId) {
        try {
            return await _favFolders.FavFoldersModel.query().insert({
                name,
                userId
            });
        } catch (error) {
            if (error instanceof _objection.ConstraintViolationError) {
                return false;
            }
            throw new _exceptions.ServicesError();
        }
    }
    async removeFavFolder(id) {
        try {
            await _favoris.FavoriModel.query().where('favFolderId', id).delete();
            return await _favFolders.FavFoldersModel.query().findById(id).delete();
        } catch (error) {
            console.log(error);
            throw new _exceptions.ServicesError();
        }
    }
    async getFolderByName(name, userId) {
        try {
            const folder = await _favFolders.FavFoldersModel.query().select('id').where({
                name,
                userId
            }).first();
            if (folder) {
                return folder;
            }
        } catch (error) {
            throw new _exceptions.ServicesError();
        }
        throw new _exceptions.InvalidCredentialsError();
    }
    async getFavInFolders(userId, { limit, page, name }) {
        try {
            let query = _favFolders.FavFoldersModel.query().where('favFolders.userId', userId);
            if (name) {
                query = query.where('name', 'like', `${name}%`);
            }
            const [{ count }] = await query.clone().limit(1).offset(0).count();
            const total = Number.parseInt(count, 10);
            const folders = await query.clone().select('favFolders.id', 'favFolders.name').leftJoin('favoris', 'favFolders.id', 'favoris.favFolderId').andWhere(function() {
                this.where('favoris.disabled', false).orWhereNull('favoris.disabled');
            }).groupBy('favFolders.id').count('favoris.id as itemsCount').modify('paginate', limit, page);
            return {
                total,
                folders
            };
        } catch (error) {
            console.log(error);
            throw new _exceptions.ServicesError();
        }
    }
};
FavorisFolderFile = _ts_decorate([
    (0, _typedi.Service)()
], FavorisFolderFile);
const _default = FavorisFolderFile;

//# sourceMappingURL=favFolders.js.map