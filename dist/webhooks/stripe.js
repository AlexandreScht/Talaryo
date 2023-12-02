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
const _stripe = /*#__PURE__*/ _interop_require_default(require("../middlewares/stripe"));
const _logger = require("../utils/logger");
const _stripe1 = /*#__PURE__*/ _interop_require_default(require("stripe"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { stripeENV } = _config.default;
const stripe = new _stripe1.default(stripeENV.KEY, {
    apiVersion: '2023-08-16'
});
const StripeWebhook = ({ app })=>{
    app.post('/webhook', (0, _stripe.default)(async (req, res, next)=>{
        try {
            const { event } = req;
            switch(event.type){
                case 'payment_intent.succeeded':
                    const stripeObject = event.data.object;
                    _logger.logger.info(`💰 PaymentIntent status: ${stripeObject.status}`);
                    break;
                default:
                    _logger.logger.info(`Unhandled event type ${event.type}`);
            }
            res.json({
                received: true
            });
        } catch (error) {
            _logger.logger.error(error);
            next(error);
        }
    }, stripe));
};
const _default = StripeWebhook;

//# sourceMappingURL=stripe.js.map