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
const _config = /*#__PURE__*/ _interop_require_default(require("../config"));
const _exceptions = require("../exceptions");
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
const _nodemailer = /*#__PURE__*/ _interop_require_default(require("nodemailer"));
const _path = require("path");
const _typedi = require("typedi");
const _util = /*#__PURE__*/ _interop_require_default(require("util"));
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const { mailer, FRONT_URL } = _config.default;
let MailerServiceFile = class MailerServiceFile {
    async sendMailAsync(mailOptions) {
        try {
            const sendMail = _util.default.promisify(this.transporter.sendMail).bind(this.transporter);
            await sendMail(mailOptions);
        } catch (error) {
            throw new _exceptions.MailerError();
        }
    }
    async Confirmation(email, firstName, userToken) {
        try {
            const templateDir = (0, _path.join)(__dirname, mailer.DIR);
            const confirmationEmail = _fs.default.readFileSync((0, _path.join)(templateDir, 'confirmation-mail.html'), {
                encoding: 'utf-8'
            });
            const htmlMailer = confirmationEmail.replace('{{url}}', FRONT_URL + `?token=${encodeURIComponent(userToken)}`).replace('{{user}}', firstName);
            const mailOptions = {
                from: mailer.USER,
                to: email,
                subject: "Confirmation d'email typescriptTest",
                html: htmlMailer
            };
            await this.sendMailAsync(mailOptions);
        } catch (error) {
            throw new _exceptions.MailerError();
        }
    }
    constructor(){
        _define_property(this, "transporter", void 0);
        this.transporter = _nodemailer.default.createTransport({
            host: mailer.HOST,
            port: parseInt(mailer.PORT),
            secure: true,
            auth: {
                user: mailer.USER,
                pass: mailer.PASSWORD
            }
        });
    }
};
MailerServiceFile = _ts_decorate([
    (0, _typedi.Service)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], MailerServiceFile);
const _default = MailerServiceFile;

//# sourceMappingURL=mailer.js.map