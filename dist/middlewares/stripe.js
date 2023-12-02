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
const _logger = require("../utils/logger");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { stripeENV } = _config.default;
//? check signature of stripe token
const stripeHost = (handle, stripe)=>async (req, res, next)=>{
        try {
            const sig = req.headers['stripe-signature'];
            const event = stripe.webhooks.constructEvent(req.body, sig, stripeENV.WEBHOOK);
            req.event = event;
            await handle(req, res, next);
        } catch (err) {
            _logger.logger.error(err.message);
            next(err);
        }
    };
const _default = stripeHost;

//# sourceMappingURL=stripe.js.map