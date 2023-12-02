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
const _googleauthlibrary = require("google-auth-library");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { security: { O2auth } } = _config.default;
const OAuthTokenCheck = async (idToken, at_hash)=>{
    const CLIENT_ID = O2auth.clientID;
    const client = new _googleauthlibrary.OAuth2Client(CLIENT_ID);
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID
        });
        const user = ticket.getPayload();
        if (at_hash === user.at_hash) {
            return [
                false,
                user
            ];
        }
        return [
            true
        ];
    } catch (error) {
        return [
            true
        ];
    }
};
const _default = OAuthTokenCheck;

//# sourceMappingURL=OAuthToken.js.map