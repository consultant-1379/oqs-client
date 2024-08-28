import service from './services/deployments.service';

export const deployments = angular
  .module('deployments', [])
  .factory('DeploymentsService', service)
  .name;
