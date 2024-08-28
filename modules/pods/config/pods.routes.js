import ListController from '../controllers/pods-list.controller';
import ListTemplate from '../views/pods-list.view.html';
import RadiatorTemplate from '../views/pods-radiator.view.html';

import ViewTemplate from '../views/pods-view.view.html';
import ViewController from '../controllers/pods-view.controller';

import CreateTemplate from '../views/pods-create.view.html';
import CreateController from '../controllers/pods-create.controller';

routeConfig.$inject = ['$stateProvider'];
export default function routeConfig($stateProvider) {
  $stateProvider
    .state('pods', {
      abstract: true,
      url: '/pods',
      template: '<ui-view/>'
    })

    .state('pods.list', {
      url: '/list',
      template: ListTemplate,
      controller: ListController,
      controllerAs: 'vm',
      resolve: {
        pods: getPods,
        deployments: ['DeploymentsService', getDeployments]
      }
    })

    .state('pods.radiator', {
      url: '/radiator',
      template: RadiatorTemplate,
      controller: ListController,
      controllerAs: 'vm',
      params: { isCustomView: null, activePods: [] },
      resolve: {
        pods: getPods,
        deployments: ['DeploymentsService', getDeployments]
      }
    })

    .state('pods.create', {
      url: '/create',
      template: CreateTemplate,
      controller: CreateController,
      controllerAs: 'vm',
      resolve: {
        pod: newPod,
        configurations: getAllConfigurations,
        creatingFromScratch: function () { return true; }
      }
    })

    .state('pods.view', {
      url: '/view/{podId}',
      template: ViewTemplate,
      controller: ViewController,
      controllerAs: 'vm',
      resolve: {
        pod: getPod,
        deployments: ['DeploymentsService', 'pod', getDeployments]
      }
    })

    .state('pods.edit', {
      url: '/edit/{podId}',
      template: CreateTemplate,
      controller: CreateController,
      controllerAs: 'vm',
      resolve: {
        pod: getPod,
        configurations: getAllConfigurations,
        creatingFromScratch: function () { return false; }
      }
    });
}

getPod.$inject = ['$stateParams', 'PodsService'];
function getPod($stateParams, PodsService) {
  return PodsService.get({
    podId: $stateParams.podId
  }).$promise;
}

getPods.$inject = ['PodsService'];
function getPods(PodsService) {
  return PodsService.query().$promise;
}

newPod.$inject = ['PodsService'];
function newPod(PodsService) {
  return new PodsService();
}

function getDeployments(DeploymentsService, pod) {
  var searchParam = (pod) ? { associatedPod: pod.name } : {};
  return DeploymentsService.Search.query(searchParam).$promise;
}

getAllConfigurations.$inject = ['ConfigurationsService'];
function getAllConfigurations(ConfigurationsService) {
  return ConfigurationsService.query({}).$promise;
}

