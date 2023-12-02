"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _app = require("./app");
const _validateEnv = require("./commands/validateEnv");
const _prepareRoutes = require("./routes/prepareRoutes");
(0, _validateEnv.ValidateDefaultEnv)();
const app = new _app.App(new _prepareRoutes.ApiRouter());
app.listen();

//# sourceMappingURL=server.js.map