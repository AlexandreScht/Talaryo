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
    booleanValidator: function() {
        return booleanValidator;
    },
    createValidator: function() {
        return createValidator;
    },
    emailValidator: function() {
        return emailValidator;
    },
    idValidator: function() {
        return idValidator;
    },
    imgValidator: function() {
        return imgValidator;
    },
    limitValidator: function() {
        return limitValidator;
    },
    linkValidator: function() {
        return linkValidator;
    },
    numberValidator: function() {
        return numberValidator;
    },
    pageValidator: function() {
        return pageValidator;
    },
    passwordValidator: function() {
        return passwordValidator;
    },
    roleValidator: function() {
        return roleValidator;
    },
    stringValidator: function() {
        return stringValidator;
    }
});
const _yup = /*#__PURE__*/ _interop_require_wildcard(require("yup"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const createValidator = (object)=>_yup.object().shape(object);
const stringValidator = _yup.string();
const emailValidator = _yup.string().email();
const roleValidator = _yup.string().oneOf([
    'admin',
    'user'
]);
const numberValidator = _yup.number().integer();
const limitValidator = _yup.number().integer().min(1).max(50).defined();
const pageValidator = _yup.number().integer().min(1).defined();
const booleanValidator = _yup.mixed().test('is-boolean', 'The value must be a boolean', function(value) {
    return typeof value === 'boolean' || typeof value === 'string' && (value === 'true' || value === 'false');
});
const linkValidator = _yup.string().url();
const imgValidator = _yup.string().matches(/^data:image\/(jpeg|jpg|png);base64,/, 'Le champ "img" doit être une URL base64 d\'une image valide');
const idValidator = _yup.number().min(1);
const passwordValidator = _yup.string().min(8).matches(RegExp("^(?=.*[\\p{Ll}])(?=.*[\\p{Lu}])(?=.*[0-9])(?=.*[^0-9\\p{Lu}\\p{Ll}]).*$", "gu"), 'Password must contain at least 1 upper & 1 lower case letters, 1 digit, 1 spe. character');

//# sourceMappingURL=validate.js.map