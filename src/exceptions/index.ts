export class ServerException extends Error {
  public status: number;
  public message: string;

  constructor(status: number = 500, message: string | string[] = 'Something went wrong') {
    super(Array.isArray(message) ? message.join(' | ') : message);
    this.status = status;
    this.message = Array.isArray(message) ? message.join(' | ') : message;
  }
}

export class NotFoundError extends ServerException {
  constructor(message: string[] | string = 'Resource not found') {
    super(404, message);
  }
}

export class InvalidArgumentError extends ServerException {
  constructor(message: string[] | string = 'Invalid arguments') {
    super(422, message);
  }
}

export class InvalidCredentialsError extends ServerException {
  constructor(message: string[] | string = 'Invalid credentials') {
    super(401, message);
  }
}

export class InvalidSessionError extends ServerException {
  constructor(message: string[] | string = 'Invalid session') {
    super(403, message);
  }
}

export class ExpiredSessionError extends ServerException {
  constructor(message: string[] | string = 'Session expired') {
    super(401, message);
  }
}

export class InvalidAccessError extends ServerException {
  constructor(message: string[] | string = 'Insufficient permission') {
    super(403, message);
  }
}

export class InvalidIdentityError extends ServerException {
  constructor(message: string[] | string = 'Please verify your identity') {
    super(401, message);
  }
}

export class ServicesError extends ServerException {
  constructor(message: string[] | string = 'Database communication failed') {
    super(505, message);
  }
}

export class MailerError extends ServerException {
  constructor(message: string[] | string = 'An error occurred while sending email') {
    super(500, message);
  }
}
