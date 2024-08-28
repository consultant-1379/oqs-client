import routes from './config/history.routes';
import menus from './config/history.menus';
import HistoryService from './services/history.service';
import './css/history.css';

export const history = angular
  .module('history', [])
  .config(routes)
  .run(menus)
  .factory('podHistoryService', HistoryService.getService('pods'))
  .factory('deploymentHistoryService', HistoryService.getService('deployments'))
  .factory('configurationHistoryService', HistoryService.getService('configurations'))
  .name;
