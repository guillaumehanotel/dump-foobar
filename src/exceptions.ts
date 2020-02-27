import { ModelClass } from './orm/model';

export class JsonEncodingException extends Error {
    status: number;

    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
      this.status = 500
    }

    statusCode(): number {
      return this.status
    }
}

export class MassAssignmentException extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = 500
  }

  statusCode(): number {
    return this.status
  }
}

export class ModelNotFoundException extends Error {
  status: number;

  constructor(id: number | string, modelClass: ModelClass<any>) {
    const message = `The ${modelClass.name} with ID ${id} doesn't exist`;
    super(message);
    this.name = this.constructor.name;
    this.status = 404
  }

  statusCode(): number {
    return this.status
  }
}

export class RelationNotFoundException extends Error {
  status: number;

  constructor(modelClass: ModelClass<any>, include: string) {
    const message = `The ${modelClass.name} doesn't have a '${include}' relation`;
    super(message);
    this.name = this.constructor.name;
    this.status = 500
  }

  statusCode(): number {
    return this.status
  }
}

export class QueryException extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = 500
  }

  statusCode(): number {
    return this.status
  }
}
