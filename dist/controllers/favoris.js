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
const _auth = /*#__PURE__*/ _interop_require_default(require("../middlewares/auth"));
const _favFolders = /*#__PURE__*/ _interop_require_default(require("../services/favFolders"));
const _favoris = /*#__PURE__*/ _interop_require_default(require("../services/favoris"));
const _validate = require("../libs/validate");
const _mw = /*#__PURE__*/ _interop_require_default(require("../middlewares/mw"));
const _validator = /*#__PURE__*/ _interop_require_default(require("../middlewares/validator"));
const _typedi = /*#__PURE__*/ _interop_require_default(require("typedi"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const FavorisController = ({ app })=>{
    const FavorisServices = _typedi.default.get(_favoris.default);
    const FavorisFolderServices = _typedi.default.get(_favFolders.default);
    app.post('/create-fav', (0, _mw.default)([
        (0, _auth.default)(),
        (0, _validator.default)({
            body: {
                link: _validate.linkValidator.required(),
                img: _validate.imgValidator.required(),
                fullName: _validate.stringValidator.nonNullable(),
                currentJob: _validate.stringValidator.nullable(),
                currentCompany: _validate.stringValidator.nullable(),
                desc: _validate.stringValidator.nonNullable(),
                favFolderId: _validate.idValidator.required()
            }
        }),
        async ({ locals: { body: { link, img, fullName, currentJob, currentCompany, desc, favFolderId } }, session: { sessionId }, res, next })=>{
            try {
                const success = await FavorisServices.createFav({
                    link,
                    img,
                    fullName,
                    currentJob,
                    currentCompany,
                    desc,
                    favFolderId
                }, sessionId);
                res.send({
                    res: success
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
    app.delete('/remove-fav', (0, _mw.default)([
        (0, _auth.default)(),
        (0, _validator.default)({
            query: {
                link: _validate.linkValidator.required(),
                favFolderId: _validate.idValidator.required()
            }
        }),
        async ({ locals: { query: { link, favFolderId } }, res, next })=>{
            try {
                const success = await FavorisServices.removeFav({
                    link,
                    favFolderId
                });
                res.send({
                    res: success
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
    app.get('/get-favoris', (0, _mw.default)([
        (0, _auth.default)(),
        (0, _validator.default)({
            query: {
                limit: _validate.limitValidator.default(10),
                page: _validate.pageValidator.default(1),
                favFolderName: _validate.stringValidator.required()
            }
        }),
        async ({ locals: { query: { limit, page, favFolderName } }, session: { sessionId }, res, next })=>{
            try {
                const favFolderModel = await FavorisFolderServices.getFolderByName(favFolderName, sessionId);
                const { favoris, total } = await FavorisServices.getFavInFolder(limit, page, favFolderModel.id);
                res.send({
                    res: {
                        list: favoris,
                        meta: {
                            total
                        }
                    }
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
    app.get('/get-lastFavoris', (0, _mw.default)([
        (0, _auth.default)(),
        async ({ session: { sessionId }, res, next })=>{
            try {
                const favoris = await FavorisServices.getLastFav(sessionId);
                res.send({
                    res: favoris
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
};
const _default = FavorisController;

//# sourceMappingURL=favoris.js.map