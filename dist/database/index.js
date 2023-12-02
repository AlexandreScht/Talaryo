"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "dbConnection", {
    enumerable: true,
    get: function() {
        return dbConnection;
    }
});
const _config = /*#__PURE__*/ _interop_require_default(require("../config"));
const _knex = /*#__PURE__*/ _interop_require_default(require("knex"));
const _objection = require("objection");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { db } = _config.default;
const dbConnection = async ()=>{
    const dbConfig = {
        client: 'pg',
        connection: {
            charset: 'utf8',
            timezone: 'UTC',
            user: db.DB_USER,
            password: db.DB_PASSWORD,
            host: db.DB_HOST,
            port: db.DB_PORT,
            database: db.DB_DATABASE
        },
        pool: {
            min: 2,
            max: 10
        }
    };
    await _objection.Model.knex((0, _knex.default)(dbConfig));
};

//# sourceMappingURL=index.js.map