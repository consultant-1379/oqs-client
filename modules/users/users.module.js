import routes from './config/users.routes';
import UsersService from './services/users.service';
import Authentication from './services/authentication.service';
import AuthenticationController from './controllers/authentication.controller.js';
import lowercase from './directives/lowercase.directive';

export const users = angular
  .module('users', [])
  .config(routes)
  .factory('UsersService', UsersService)
  .factory('Authentication', Authentication)
  .controller('AuthenticationController', AuthenticationController)
  .directive('lowercase', lowercase)
  .name;
