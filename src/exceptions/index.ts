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
