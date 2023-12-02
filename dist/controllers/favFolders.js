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
const _validate = require("../libs/validate");
const _auth = /*#__PURE__*/ _interop_require_default(require("../middlewares/auth"));
const _validator = /*#__PURE__*/ _interop_require_default(require("../middlewares/validator"));
const _favFolders = /*#__PURE__*/ _interop_require_default(require("../services/favFolders"));
const _mw = /*#__PURE__*/ _interop_require_default(require("../middlewares/mw"));
const _typedi = /*#__PURE__*/ _interop_require_default(require("typedi"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const FoldersController = ({ app })=>{
    const FavorisFolderServices = _typedi.default.get(_favFolders.default);
    app.post('/create-favFolders', (0, _mw.default)([
        (0, _auth.default)(),
        (0, _validator.default)({
            body: {
                name: _validate.stringValidator.required()
            }
        }),
        async ({ locals: { body: { name } }, session: { sessionId }, res, next })=>{
            try {
                const success = await FavorisFolderServices.createFolder(name, sessionId);
                res.send({
                    res: success
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
    app.delete('/remove-favFolders', (0, _mw.default)([
        (0, _validator.default)({
            query: {
                id: _validate.idValidator.required()
            }
        }),
        async ({ locals: { query: { id } }, res, next })=>{
            try {
                const countDeleted = await FavorisFolderServices.removeFavFolder(id);
                res.send({
                    res: countDeleted
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
    app.get('/get-favFolders', (0, _mw.default)([
        (0, _auth.default)(),
        (0, _validator.default)({
            query: {
                limit: _validate.limitValidator.default(10),
                page: _validate.pageValidator.default(1),
                name: _validate.stringValidator
            }
        }),
        async ({ locals: { query: { name, page, limit } }, session: { sessionId }, res, next })=>{
            try {
                const { folders, total } = await FavorisFolderServices.getFavInFolders(sessionId, {
                    limit,
                    page,
                    name
                });
                res.send({
                    res: {
                        folders,
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
};
const _default = FoldersController;

//# sourceMappingURL=favFolders.js.map