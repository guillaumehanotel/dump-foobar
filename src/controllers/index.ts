import Controller, { HTTPMethod } from '../controller'
import { Author, Post } from '../models'

export class AuthorController extends Controller {
  modelClass = Author

  static customRoutes = [
    {
      path: `/${AuthorController.getPath()}/hello`,
      httpMethod: HTTPMethod.GET,
      methodName: 'helloWorld',
    },
  ]

  static disabledRoutes = ['deleteList']

  async helloWorld(): Promise<void> {
    this.res.statusCode = 200
    this.res.write('hello world')
  }
}
export class PostController extends Controller {
  modelClass = Post
}
