import { IncomingMessage, ServerResponse } from 'http'
import { parse, ParsedUrlQuery } from 'querystring'
import Model, { QueryFilter } from './orm/model'

export interface ClientRequest extends IncomingMessage {
  url: string;
  getBody(): Promise<any>;
}

export enum HTTPMethod {
  GET='GET', POST='POST', PUT='PUT', PATCH='PATCH', DELETE='DELETE'
}

interface CustomRoute {
  path: string;
  httpMethod: HTTPMethod;
  methodName: string;
}

class BaseError extends Error {
  public readonly statusCode: number;

  constructor(m: string, statusCode = 400) {
    super(m);
    this.statusCode = statusCode
  }
}

class BadRequest extends BaseError {}

// todo put it into model
class ConstraintViolation extends BaseError {}

interface ControllerOutputSimple { resource?: object; statusCode?: number; headers?: Record<string, string> }
interface ControllerOutputList { resource?: object[]; statusCode?: number; headers?: Record<string, string> }

export default class Controller {
  protected modelClass!: typeof Model

  protected req: ClientRequest

  protected res: ServerResponse

  static customRoutes: CustomRoute[] = []

  static disabledRoutes: string[] = []

  constructor(req: ClientRequest, res: ServerResponse) {
    this.req = req
    this.res = res
  }

  static getPath(): string {
    return `${this.name.split('Controller')[0].toLowerCase()}s`
  }

  getPath(): string {
    // @ts-ignore
    return `/${this.constructor.getPath()}`
  }

  getQueryString(): ParsedUrlQuery {
    return parse(this.req.url.split('?')[1])
  }

  async getCurrentResourceId(): Promise<number> {
    const urlPathId = parseInt(this.req.url.split('/')[2].split('?')[0], 10)
    const body = await this.req.getBody()
    if (body && body.id !== urlPathId) {
      throw new BadRequest('Conflict between url id and body id')
    }
    return urlPathId
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Retrieve representation of the member resource in the response body.
   */
  async get(): Promise<ControllerOutputSimple | void> {
    const queryString = this.getQueryString()
    let includes = 'includes' in queryString ? queryString.includes : []
    if (typeof includes === 'string') {
      includes = [includes]
    }
    const resource = await this.modelClass.findById(await this.getCurrentResourceId(), { includes })
    if (resource !== undefined) {
      return { resource, headers: { 'Content-Type': 'application/json' } }
    }
    return { statusCode: 404 }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Retrieve the representations of the member resources of the collection resource in the response body.
   */
  async getList(): Promise<ControllerOutputList | void> {
    const where: Record<string, any> = {}
    for (const [key, value] of Object.entries(this.getQueryString())) {
      if (!['limit', 'sort', 'order', 'offset', 'includes'].includes(key)) {
        where[key] = value
      }
    }
    const queryFilter: QueryFilter = { where }
    Object.assign(queryFilter, this.getQueryString())
    return { resource: await this.modelClass.find(queryFilter), headers: { 'Content-Type': 'application/json' } }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Create a member resource in the member resource using the instructions in the request body.
   * The URI of the created member resource is automatically assigned and returned in the response Location header field.
   */
  async post(): Promise<ControllerOutputSimple | void> {
    const resources = await this.modelClass.find({ where: { id: await this.getCurrentResourceId() } })
    if (resources.length !== 0) {
      throw new BadRequest('This resource already exists', 422)
    } else {
      try {
        const resource = await this.modelClass.create(await this.req.getBody())
        return { statusCode: 201, headers: { location: `${this.getPath()}/${resource.id}` }, resource }
      } catch (e) {
        if (e.toString().includes('constraint failed')) {
          throw new ConstraintViolation(e.toString(), 422)
        } else {
          throw e
        }
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Create a member resource in the collection resource using the instructions in the request body.
   * The URIs of the created members resource are automatically assigned and returned in the response Location header field.
   */
  async postList(): Promise<ControllerOutputList | void> {
    const locations = []
    try {
      for (const model of await this.modelClass.createFromList(await this.req.getBody())) {
        locations.push(`${this.getPath()}/${model.id}`)
      }
      return { statusCode: 201, headers: { Location: JSON.stringify(locations) } }
    } catch (e) {
      if (e.toString().includes('constraint failed')) {
        throw new ConstraintViolation(e.toString(), 422)
      } else {
        throw e
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Replace all the representations of the member resource or create the member resource if it does not exist,
   * with the representation in the request body.
   */
  async put(): Promise<ControllerOutputSimple | void> {
    const resourceId = await this.getCurrentResourceId()
    const body = await this.req.getBody()
    const output: ControllerOutputSimple = {}
    if (await this.modelClass.findById(resourceId)) {
      await this.modelClass.updateById(resourceId, body);
      output.statusCode = 204
    } else {
      await this.modelClass.create(body);
      output.statusCode = 201
      output.headers = { Location: `${this.getPath()}/${body.id}` }
    }
    return output
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Replace all the representations of the member resources of the collection resource with the representation in the request body,
   * or create the collection resource if it does not exist.
   */
  async putList(): Promise<ControllerOutputList | void> {
    const promises = []
    const statusCodes = []
    const locations = []
    for (const bodyElement of await this.req.getBody()) {
      if (await this.modelClass.findById(bodyElement.id)) {
        promises.push(this.modelClass.updateById(bodyElement.id, bodyElement))
        statusCodes.push(204)
      } else {
        promises.push(this.modelClass.create(bodyElement))
        statusCodes.push(201)
        locations.push(`${this.getPath()}/${bodyElement.id}`)
      }
    }
    try {
      await Promise.all(promises)
    } catch (e) {
      if (e.toString().includes('constraint failed')) {
        throw new ConstraintViolation(e.toString(), 422)
      } else {
        throw e
      }
    }
    const output: ControllerOutputList = {}
    if ((201 in statusCodes && 204 in statusCodes) || statusCodes.length === 0) output.statusCode = 200
    else [output.statusCode] = statusCodes
    if (locations.length !== 0) output.headers = { Location: JSON.stringify(locations) }
    return output
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Update all the representations of the member resource,
   * or may create the member resource if it does not exist, using the instructions in the request body.
   */
  async patch(): Promise<ControllerOutputSimple | void> {
    return { statusCode: 501 }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Update all the representations of the member resources of the collection resource using the instructions in the request body,
   * or may create the collection resource if it does not exist.
   */

  async patchList(): Promise<ControllerOutputList | void> {
    return { statusCode: 501 }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Delete all the representations of the member resource.
   */
  async delete(): Promise<ControllerOutputSimple | void> {
    await this.modelClass.deleteById(await this.getCurrentResourceId())
    return { statusCode: 204 }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Delete all the representations of the member resources of the collection resource.
   */
  async deleteList(): Promise<ControllerOutputList | void> {
    await this.modelClass.deleteByIdList((await this.req.getBody()).ids)
    return { statusCode: 204 }
  }
}
