"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ValidateDefaultEnv: function() {
        return ValidateDefaultEnv;
    },
    ValidateEnv: function() {
        return ValidateEnv;
    }
});
const _envalid = require("envalid");
const ValidateDefaultEnv = ()=>{
    (0, _envalid.cleanEnv)(process.env, {
        NODE_ENV: (0, _envalid.str)({
            choices: [
                'development',
                'production'
            ],
            default: 'development'
        }),
        PORT: (0, _envalid.port)()
    });
};
const ValidateEnv = ()=>{
    (0, _envalid.cleanEnv)(process.env, {
        PORT: (0, _envalid.port)(),
        FRONT_URL: (0, _envalid.str)(),
        DB_USER: (0, _envalid.str)(),
        DB_PASSWORD: (0, _envalid.str)(),
        DB_HOST: (0, _envalid.str)(),
        DB_Port: (0, _envalid.port)(),
        DB_DATABASE: (0, _envalid.str)(),
        RECAPTCHA_SECRET_KEY: (0, _envalid.str)(),
        JWT_SECRET: (0, _envalid.str)(),
        SESSION_SECRET: (0, _envalid.str)(),
        PASSWORD_PEPPER: (0, _envalid.str)(),
        PROXY_SERVER: (0, _envalid.str)(),
        PROXY_USERNAME: (0, _envalid.str)(),
        PROXY_PASSWORD: (0, _envalid.str)(),
        LOG_FORMAT: (0, _envalid.str)({
            choices: [
                'combined',
                'dev'
            ],
            default: 'dev'
        }),
        LOG_DIR: (0, _envalid.str)({
            default: '../logs'
        }),
        MAILER_DIR: (0, _envalid.str)({
            default: '../templates'
        }),
        MAILER_USER: (0, _envalid.str)(),
        MAILER_PASSWORD: (0, _envalid.str)(),
        MAILER_PORT: (0, _envalid.str)(),
        MAILER_HOST: (0, _envalid.str)(),
        ORIGIN: (0, _envalid.str)(),
        CREDENTIALS: (0, _envalid.bool)(),
        STRIPE_SECRET_KEY: (0, _envalid.str)(),
        STRIPE_SECRET_WEBHOOK: (0, _envalid.str)(),
        LINKEDIN: (0, _envalid.str)()
    });
};

//# sourceMappingURL=validateEnv.js.map