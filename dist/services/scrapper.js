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
    ScrapperServiceFile: function() {
        return ScrapperServiceFile;
    },
    default: function() {
        return _default;
    }
});
const _exceptions = require("../exceptions");
const _puppeteer = require("../utils/puppeteer");
const _cheerio = require("cheerio");
const _typedi = require("typedi");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ScrapperServiceFile = class ScrapperServiceFile extends _puppeteer.ApiPuppeteer {
    shuffleArray(v) {
        const shuffleArr = [].concat(...v);
        for(let i = shuffleArr.length - 1; i > 0; i--){
            const mixed = Math.floor(Math.random() * (i + 1));
            [shuffleArr[i], shuffleArr[mixed]] = [
                shuffleArr[mixed],
                shuffleArr[i]
            ];
        }
        return shuffleArr;
    }
    getFn(name) {
        const functionName = {
            LinkedIn: [
                this.LinkedIn,
                'https://www.google.com/search'
            ]
        };
        return functionName[name];
    }
    async scrape(data) {
        const values = data.map((v)=>_object_spread_props(_object_spread({}, v), {
                props: this.getFn(v.site),
                retryCount: 0
            }));
        this.check(values);
        const [error, success] = await this.open(values);
        if (error) {
            throw new _exceptions.ServerException();
        }
        const number = success.filter((o)=>o.number).reduce((acc, n)=>{
            return acc += n.number;
        }, 0);
        const result = success.filter((o)=>o.data).map((obj)=>{
            if (!obj.current) {
                return obj.data;
            }
            return obj.data.filter((v)=>v.currentCompany);
        });
        if (result.length === 1) {
            return {
                scrape: result[0],
                number
            };
        }
        return {
            scrape: this.shuffleArray(result),
            number
        };
    }
    LinkedIn(html) {
        //? ----- linkedIn logic -----
        const $ = (0, _cheerio.load)(html);
        const linkedIn = [];
        const img = $('div.N54PNb.BToiNc.cvP2Ce').find('img.XNo5Ab').attr('src');
        $('div.N54PNb.BToiNc.cvP2Ce').each((_, element)=>{
            const link = $(element).find('a[jsname="UWckNb"]').attr('href');
            const title = $(element).find('h3.LC20lb.MBeuO.DKV0Md').text().split(' - ');
            const chip = [];
            const chipWrapper = $(element).find('div.lhLbod.gEBHYd');
            if (chipWrapper) {
                chipWrapper.find('span').each((_, element)=>{
                    const chipText = $(element).text();
                    if (chipText !== ' · ') {
                        chip.push(chipText);
                    }
                });
            }
            const desc = $(element).find('div.VwiC3b.yXK7lf.lyLwlc.yDYNvb.W8l4ac.lEBKkf').text();
            const fullName = (title === null || title === void 0 ? void 0 : title.length) > 0 ? title[0].toString().trim() : undefined;
            const currentJob = (chip === null || chip === void 0 ? void 0 : chip.length) > 2 ? chip[1].toString().trim() : (title === null || title === void 0 ? void 0 : title.length) > 1 ? title[1].toString().trim() : undefined;
            const currentCompany = (title === null || title === void 0 ? void 0 : title.length) > 2 ? title[2].toString().trim() : (chip === null || chip === void 0 ? void 0 : chip.length) > 1 ? chip[chip.length - 1].toString().trim() : undefined;
            linkedIn.push({
                link,
                img,
                fullName,
                currentJob,
                currentCompany,
                desc: desc === null || desc === void 0 ? void 0 : desc.trim()
            });
        });
        return linkedIn;
    }
};
ScrapperServiceFile = _ts_decorate([
    (0, _typedi.Service)()
], ScrapperServiceFile);
const _default = ScrapperServiceFile;

//# sourceMappingURL=scrapper.js.map