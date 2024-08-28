import routes from './config/pods.routes';
import menus from './config/pods.menus';
import service from './services/pods.service';
import './css/pods.css';

export const pods = angular
  .module('pods', [])
  .config(routes)
  .run(menus)
  .factory('PodsService', service)
  .name;
