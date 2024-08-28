import routes from './config/configurations.routes';
import menus from './config/configurations.menus';
import service from './services/configurations.service';
import './css/configurations.css';

export const configurations = angular
  .module('configurations', [])
  .config(routes)
  .run(menus)
  .factory('ConfigurationsService', service)
  .name;
