import UserControllerFile from '@/controllers/users';
import { getAllUsersSchema, updateSchema, updateUserSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { UserShapeSchema } from '@/utils/zodValidate';
import { Router } from 'express';

export class UserRouter extends UserControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch('/update', mw([auth(), Validator({ body: updateSchema }), this.updateCurrentUser]));
    this.router.get('/getAll', mw([auth(), Validator({ query: getAllUsersSchema }), this.getAllUsers]));
    this.router.patch('/update/:user', mw([auth('admin'), Validator({ params: updateUserSchema, body: UserShapeSchema() }), this.updateUser]));
  }

  getRouter() {
    return this.router;
  }
}
