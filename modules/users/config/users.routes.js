import authenticationController from '../controllers/authentication.controller';
import authenticationView from '../views/authentication/authentication.view.html';
import signInView from '../views/authentication/signin.view.html';
import UsersService from '../services/users.service';
import ListController from '../controllers/users-list.client.controller';
import ListTemplate from '../views/users-list.client.view.html';
import CreateController from '../controllers/users-create.client.controller';
import CreateTemplate from '../views/users-create.client.view.html';
routeConfig.$inject = ['$stateProvider'];

export default function routeConfig($stateProvider) {
  $stateProvider
    .state('authentication', {
      abstract: true,
      url: '/authentication',
      template: authenticationView,
      controller: authenticationController,
      controllerAs: 'vm'
    })
    .state('authentication.signin', {
      url: '/signin?err',
      template: signInView,
      controller: authenticationController,
      controllerAs: 'vm'
    });

  $stateProvider
    .state('users', {
      abstract: true,
      url: '/users',
      template: '<ui-view/>'
    })
    .state('users.list', {
      url: '/list',
      template: ListTemplate,
      controller: ListController,
      controllerAs: 'vm',
      resolve: {
        allUsers: getAllUsers
      }
    })
    .state('users.create', {
      url: '/create',
      template: CreateTemplate,
      controller: CreateController,
      controllerAs: 'vm',
      resolve: {
        allUsers: getAllUsers
      }
    });
}

getAllUsers.$inject = ['UsersService'];
function getAllUsers(UsersService) {
  return UsersService.query().$promise;
}
