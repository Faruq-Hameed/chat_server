export class HttpException extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpException";
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, 400);
    this.name = "BadRequestException";
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundException";
  }
}

export class TokenException extends HttpException {
  constructor() {
    super("Invalid or expired token", 403);
    this.name = "TokenException";
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden request") {
    super(message, 401);
    this.name = "ForbiddenException";
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = "Conflict request") {
    super(message, 409);
    this.name = "ConflictException";
  }
}