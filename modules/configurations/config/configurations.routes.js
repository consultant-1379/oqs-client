import ListController from '../controllers/configurations-list.controller';
import ListTemplate from '../views/configurations-list.view.html';

import ViewTemplate from '../views/configurations-view.view.html';
import ViewController from '../controllers/configurations-view.controller';

import CreateTemplate from '../views/configurations-create.view.html';
import CreateController from '../controllers/configurations-create.controller';

routeConfig.$inject = ['$stateProvider'];
export default function routeConfig($stateProvider) {
  $stateProvider
    .state('configurations', {
      abstract: true,
      url: '/configurations',
      template: '<ui-view/>'
    })

    .state('configurations.list', {
      url: '/list',
      template: ListTemplate,
      controller: ListController,
      controllerAs: 'vm',
      resolve: {
        configurations: getConfigurations
      }
    })

    .state('configurations.create', {
      url: '/create',
      template: CreateTemplate,
      controller: CreateController,
      controllerAs: 'vm',
      resolve: {
        configuration: newConfiguration,
        pods: getPods,
        creatingFromScratch: function () { return true; }
      }
    })

    .state('configurations.view', {
      url: '/view/{configurationId}',
      template: ViewTemplate,
      controller: ViewController,
      controllerAs: 'vm',
      resolve: {
        configuration: getConfiguration
      }
    })

    .state('configurations.edit', {
      url: '/edit/{configurationId}',
      template: CreateTemplate,
      controller: CreateController,
      controllerAs: 'vm',
      resolve: {
        configuration: getConfiguration,
        pods: getPods,
        creatingFromScratch: function () { return false; }
      }
    });
}

getConfiguration.$inject = ['$stateParams', 'ConfigurationsService'];
function getConfiguration($stateParams, ConfigurationsService) {
  return ConfigurationsService.get({
    configurationId: $stateParams.configurationId
  }).$promise;
}

getConfigurations.$inject = ['ConfigurationsService'];
function getConfigurations(ConfigurationsService) {
  return ConfigurationsService.query().$promise;
}

newConfiguration.$inject = ['ConfigurationsService'];
function newConfiguration(ConfigurationsService) {
  return new ConfigurationsService();
}

getPods.$inject = ['PodsService'];
function getPods(PodsService) {
  return PodsService.query().$promise;
}
