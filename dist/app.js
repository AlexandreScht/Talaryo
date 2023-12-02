"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "App", {
    enumerable: true,
    get: function() {
        return App;
    }
});
const _config = /*#__PURE__*/ _interop_require_default(require("./config"));
const _database = require("./database");
const _error = require("./middlewares/error");
const _logger = require("./utils/logger");
const _compression = /*#__PURE__*/ _interop_require_default(require("compression"));
const _cookieparser = /*#__PURE__*/ _interop_require_default(require("cookie-parser"));
const _cors = /*#__PURE__*/ _interop_require_default(require("cors"));
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _helmet = /*#__PURE__*/ _interop_require_default(require("helmet"));
const _hpp = /*#__PURE__*/ _interop_require_default(require("hpp"));
const _http = /*#__PURE__*/ _interop_require_default(require("http"));
const _morgan = /*#__PURE__*/ _interop_require_default(require("morgan"));
require("reflect-metadata");
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { log } = _config.default;
let App = class App {
    listen() {
        this.server.listen(this.port, ()=>{
            _logger.logger.info(`======= Version: ${this.env} =======
        🚀 server listening on the port: ${this.port} 🚀`);
        });
    }
    getServer() {
        return this.app;
    }
    async connectToDatabase() {
        await (0, _database.dbConnection)();
    }
    initializeMiddlewares() {
        this.app.use((0, _morgan.default)(log.FORMAT, {
            stream: _logger.stream
        }));
        this.app.use((0, _cors.default)({
            origin: _config.default.ORIGIN,
            credentials: _config.default.CREDENTIALS
        }));
        this.app.use((0, _hpp.default)());
        this.app.use((0, _helmet.default)());
        this.app.use((0, _compression.default)());
        this.initializeBodyContent();
        this.app.use(_express.default.urlencoded({
            extended: true
        }));
        this.app.use((0, _cookieparser.default)());
    }
    initializeBodyContent() {
        this.app.use((req, res, next)=>{
            //  for stripe webhook
            if (req.url === '/api/webhook') {
                _express.default.raw({
                    type: 'application/json'
                })(req, res, next);
            } else {
                _express.default.json()(req, res, next);
            }
        });
    }
    initializeRoutes(routes) {
        this.app.use('/api', routes.router);
    }
    initializeErrorHandling() {
        this.app.use(_error.ErrorMiddleware);
    }
    defaultError() {
        this.app.use((req, res)=>{
            res.status(404).send({
                error: `Cannot find or << ${req.method} >> is incorrect method at ${req.url}`
            });
        });
    }
    constructor(routes){
        _define_property(this, "app", void 0);
        _define_property(this, "env", void 0);
        _define_property(this, "port", void 0);
        _define_property(this, "server", void 0);
        this.app = (0, _express.default)();
        this.env = _config.default.NODE_ENV || 'development';
        this.port = _config.default.PORT || 3005;
        this.server = _http.default.createServer(this.app);
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
        this.defaultError();
    }
};

//# sourceMappingURL=app.js.map