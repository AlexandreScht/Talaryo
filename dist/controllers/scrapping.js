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
const _serializeLoc = /*#__PURE__*/ _interop_require_default(require("../libs/serializeLoc"));
const _sites = /*#__PURE__*/ _interop_require_default(require("../libs/sites"));
const _auth = /*#__PURE__*/ _interop_require_default(require("../middlewares/auth"));
const _favoris = /*#__PURE__*/ _interop_require_default(require("../services/favoris"));
const _scrapper = /*#__PURE__*/ _interop_require_default(require("../services/scrapper"));
const _validate = require("../libs/validate");
const _mw = /*#__PURE__*/ _interop_require_default(require("../middlewares/mw"));
const _validator = /*#__PURE__*/ _interop_require_default(require("../middlewares/validator"));
const _typedi = /*#__PURE__*/ _interop_require_default(require("typedi"));
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const ScrappingController = ({ app })=>{
    const ScrapperServices = _typedi.default.get(_scrapper.default);
    const FavorisServices = _typedi.default.get(_favoris.default);
    app.get('/scrapping', (0, _mw.default)([
        (0, _auth.default)(),
        (0, _validator.default)({
            query: {
                platform: _validate.stringValidator.required(),
                fn: _validate.stringValidator,
                industry: _validate.stringValidator,
                sector: _validate.stringValidator,
                skill: _validate.stringValidator,
                key: _validate.stringValidator,
                loc: _validate.stringValidator,
                Nindustry: _validate.stringValidator,
                Nskill: _validate.stringValidator,
                Nkey: _validate.stringValidator,
                time: _validate.stringValidator,
                zone: _validate.stringValidator,
                start: _validate.numberValidator,
                index: _validate.numberValidator
            }
        }),
        async ({ locals: { query: { platform, fn, industry, sector, skill, key, loc, Nindustry, Nskill, Nkey, time, zone, index = 50, start = 0 } }, session: { sessionId }, res, next })=>{
            try {
                const Searches = [];
                const queries = {
                    fn,
                    industry,
                    sector,
                    skill,
                    key,
                    loc,
                    Nindustry,
                    Nskill,
                    Nkey
                };
                const sources = platform.split(',');
                sources.forEach((s)=>{
                    const url = Object.keys(queries).reduce((acc, key)=>{
                        if (key === 'fn') {
                            const str = queries[key].split(',').map((v)=>`intitle:${v.replaceAll(' ', '-')}`);
                            return acc += ` ${str.join(' | ')}`;
                        }
                        if (key === 'industry') {
                            const str = queries[key].split(',').map((v)=>`inanchor:${v.replaceAll(' ', '-')}`);
                            return acc += ` ${str.join(' | ')}`;
                        }
                        if (key === 'skill' || key === 'key') {
                            const str = queries[key].split(',').map((v)=>v.replaceAll(' ', '-'));
                            return acc += ` ${str.join('&')}`;
                        }
                        if (key === 'sector') {
                            const str = queries[key].split(',').map((v)=>v.replaceAll(' ', '-'));
                            return acc += ` ${str.join(' | ')}`;
                        }
                        if (key === 'Nindustry') {
                            const str = queries[key].split(',').map((v)=>`-inanchor:${v.replaceAll(' ', '-')}`);
                            return acc += ` ${str.join(' | ')}`;
                        }
                        if (key === 'Nskill' || key === 'Nkey') {
                            const str = queries[key].split(',').map((v)=>`-${v.replaceAll(' ', '-')}`);
                            return acc += ` ${str.join(' | ')}`;
                        }
                        if (key === 'loc') {
                            return acc += ` ${(0, _serializeLoc.default)(loc, zone)}`;
                        }
                        return acc;
                    }, (0, _sites.default)(s));
                    Searches.push({
                        url: `https://www.google.com/search?client=opera&q=${encodeURIComponent(url)}&start=${start}&num=${index}`,
                        site: s,
                        current: time !== null && time !== void 0 ? time : false
                    });
                });
                const result = await ScrapperServices.scrape(Searches);
                const favMap = await FavorisServices.findAllUserFav(sessionId, result.scrape);
                const links = result.scrape.map((obj)=>_object_spread_props(_object_spread({}, obj), {
                        favFolderId: favMap.get(obj.link) || undefined
                    }));
                res.send({
                    res: links,
                    data: {
                        start,
                        index,
                        number: result.number
                    }
                });
            } catch (error) {
                next(error);
            }
        }
    ]));
};
const _default = ScrappingController;

//# sourceMappingURL=scrapping.js.map