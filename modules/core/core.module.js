import uiNotification from 'angular-ui-notification';
import routes from './config/core.routes';
import menus from './config/core.menus';
import routeFilter from './config/core.route-filter';
import headerCtrl from './controllers/header.controller';
import errorCtrl from './controllers/error.controller';
import menuService from './services/menu.service.js';
import authInterceptor from './services/interceptors/auth-interceptor.service';
import jsonText from './directives/json-text.directive';
import yamlText from './directives/yaml-text.directive';
import versionValidator from './directives/version-validator.directive';
import httpLoading from './directives/http-loading.directive';
import stopPropagation from './directives/stop-propagation.directive';
import autofocus from './directives/autofocus.directive';
import uiNotificationConfig from './config/ui.notification.js';
import headerView from './directives/header-view.directive';
import 'expose-loader?tv4!tv4'; // Workaround for https://github.com/json-schema-form/angular-schema-form/issues/914
import 'angular-schema-form';
import 'angular-schema-form-bootstrap';
import 'angular-bootstrap-toggle';
import 'angular-bootstrap-toggle/dist/angular-bootstrap-toggle.min.css';
import 'angular-ui-notification/dist/angular-ui-notification.min.css';
import './css/assets.css';
import './css/bootstrap.css';
import './css/core.css';
import './css/systemBar.css';
import './img/brand/favicon.ico';

export const core = angular
  .module('core', ['ui-notification'])
  .config(routes)
  .config(uiNotificationConfig)
  .run(menus)
  .run(routeFilter)
  .controller('HeaderController', headerCtrl)
  .controller('ErrorController', errorCtrl)
  .factory('menuService', menuService)
  .factory('authInterceptor', authInterceptor)
  .directive('jsonText', jsonText)
  .directive('yamlText', yamlText)
  .directive('versionValidator', versionValidator)
  .directive('httpLoading', httpLoading)
  .directive('stopPropagation', stopPropagation)
  .directive('autofocus', autofocus)
  .directive('headerView', headerView)
  .name;
