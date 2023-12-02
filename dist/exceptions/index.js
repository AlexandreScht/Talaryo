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
    ExpiredSessionError: function() {
        return ExpiredSessionError;
    },
    InvalidAccessError: function() {
        return InvalidAccessError;
    },
    InvalidArgumentError: function() {
        return InvalidArgumentError;
    },
    InvalidCredentialsError: function() {
        return InvalidCredentialsError;
    },
    InvalidIdentityError: function() {
        return InvalidIdentityError;
    },
    InvalidSessionError: function() {
        return InvalidSessionError;
    },
    MailerError: function() {
        return MailerError;
    },
    NotFoundError: function() {
        return NotFoundError;
    },
    ServerException: function() {
        return ServerException;
    },
    ServicesError: function() {
        return ServicesError;
    }
});
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
let ServerException = class ServerException extends Error {
    constructor(status = 500, message = 'Something went wrong'){
        console.log(message);
        super(Array.isArray(message) ? message.join(' | ') : message);
        _define_property(this, "status", void 0);
        _define_property(this, "message", void 0);
        this.status = status;
        this.message = Array.isArray(message) ? message.join(' | ') : message;
    }
};
let NotFoundError = class NotFoundError extends ServerException {
    constructor(message = 'Resource not found'){
        super(404, message);
    }
};
let InvalidArgumentError = class InvalidArgumentError extends ServerException {
    constructor(message = 'Invalid arguments'){
        super(422, message);
    }
};
let InvalidCredentialsError = class InvalidCredentialsError extends ServerException {
    constructor(message = 'Invalid credentials'){
        super(401, message);
    }
};
let InvalidSessionError = class InvalidSessionError extends ServerException {
    constructor(message = 'Invalid session'){
        super(403, message);
    }
};
let ExpiredSessionError = class ExpiredSessionError extends ServerException {
    constructor(message = 'Session expired'){
        super(401, message);
    }
};
let InvalidAccessError = class InvalidAccessError extends ServerException {
    constructor(message = 'Insufficient permission'){
        super(403, message);
    }
};
let InvalidIdentityError = class InvalidIdentityError extends ServerException {
    constructor(message = 'Please verify your identity'){
        super(401, message);
    }
};
let ServicesError = class ServicesError extends ServerException {
    constructor(message = 'Database communication failed'){
        super(505, message);
    }
};
let MailerError = class MailerError extends ServerException {
    constructor(message = 'An error occurred while sending email'){
        super(500, message);
    }
};

//# sourceMappingURL=index.js.map