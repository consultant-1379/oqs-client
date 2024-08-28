import ListController from '../controllers/history-list.controller';
import ListTemplate from '../views/history-list.view.html';

import ViewTemplate from '../views/history-view.view.html';
import ViewController from '../controllers/history-view.controller';

routeConfig.$inject = ['$stateProvider'];
export default function routeConfig($stateProvider) {
  $stateProvider
    .state('history', {
      abstract: true,
      url: '/logs',
      template: '<ui-view/>'
    })

    .state('history.list', {
      url: '/{objType}/list',
      template: ListTemplate,
      controller: ListController,
      controllerAs: 'vm',
      resolve: { logs: getAllObjectLogs }
    })

    .state('history.view', {
      url: '/{objType}/view/{objId}',
      template: ViewTemplate,
      controller: ViewController,
      controllerAs: 'vm',
      resolve: { log: getObjectLog }
    });
}

getAllObjectLogs.$inject = ['$stateParams', 'podHistoryService', 'deploymentHistoryService', 'configurationHistoryService'];
function getAllObjectLogs($stateParams, podHistoryService, deploymentHistoryService, configurationHistoryService) {
  switch ($stateParams.objType) {
    case 'pods': return podHistoryService.query().$promise;
    case 'deployments': return deploymentHistoryService.query().$promise;
    case 'configurations': return configurationHistoryService.query().$promise;
    default: // do nothing
  }
}

getObjectLog.$inject = ['$stateParams', 'podHistoryService', 'deploymentHistoryService', 'configurationHistoryService'];
function getObjectLog($stateParams, podHistoryService, deploymentHistoryService, configurationHistoryService) {
  switch ($stateParams.objType) {
    case 'pods': return podHistoryService.get({ objId: $stateParams.objId }).$promise;
    case 'deployments': return deploymentHistoryService.get({ objId: $stateParams.objId }).$promise;
    case 'configurations': return configurationHistoryService.get({ objId: $stateParams.objId }).$promise;
    default: // do nothing
  }
}
