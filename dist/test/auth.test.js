"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _app = require("../app");
const _prepareRoutes = require("../routes/prepareRoutes");
const _supertest = /*#__PURE__*/ _interop_require_default(require("supertest"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
afterAll(async ()=>{
    await new Promise((resolve)=>setTimeout(()=>resolve(), 500));
});
describe('Testing Auth', ()=>{
    describe('[POST] /register', ()=>{
        it('response should have true', ()=>{
            const userData = {
                email: 'test@gmail.com',
                password: 'Default08!',
                token: 'disabledToken'
            };
            const app = new _app.App(new _prepareRoutes.ApiRouter());
            return (0, _supertest.default)(app.getServer()).post('/api/register').send(userData).expect(201);
        });
    });
    describe('[POST] /login', ()=>{
        it('response should have true', ()=>{
            const userData = {
                email: 'test@gmail.com',
                password: 'Default08!',
                token: 'disabledToken'
            };
            const app = new _app.App(new _prepareRoutes.ApiRouter());
            return (0, _supertest.default)(app.getServer()).post('/api/login').send(userData).expect(200);
        });
    });
});

//# sourceMappingURL=auth.test.js.map