import { role } from '@/interfaces/models';

export class ServerException extends Error {
  public status: number;
  public message: string;

  constructor(status: number = 500, message: string | string[] = "Une erreur s'est produite") {
    super(Array.isArray(message) ? message.join(' | ') : message);
    this.status = status;
    this.message = Array.isArray(message) ? message.join(' | ') : message;
  }
}

export class NotFoundError extends ServerException {
  constructor(message: string[] | string = 'Ressource non trouvée') {
    super(404, message);
  }
}

export class InvalidArgumentError extends ServerException {
  constructor(message: string[] | string = 'Arguments invalides') {
    super(422, message);
  }
}

export class InvalidCredentialsError extends ServerException {
  constructor(message: string[] | string = 'Identifiants invalides') {
    super(401, message);
  }
}

export class InvalidSessionError extends ServerException {
  constructor(message: string[] | string = 'Session invalide') {
    super(403, message);
  }
}

export class ExpiredSessionError extends ServerException {
  constructor(message: string[] | string = 'Session expirée') {
    super(401, message);
  }
}

export class InvalidAccessError extends ServerException {
  constructor(message: string[] | string = 'Permission insuffisante') {
    super(403, message);
  }
}
export class InvalidRoleAccessError extends ServerException {
  constructor(role: role) {
    super(403, `Cette fonctionnalité est disponible à partir de l'abonnement ${role}`);
  }
}

export class ServicesError extends ServerException {
  constructor(message: string[] | string = 'Echec de la connexion avec la base de donnees') {
    super(505, message);
  }
}

export class MailerError extends ServerException {
  constructor(message: string[] | string = "Erreur lors de l'envoi du mail") {
    super(500, message);
  }
}
