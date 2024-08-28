import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngMessages from 'angular-messages';
import ngRoute from 'angular-route';
import ngSanitize from 'angular-sanitize';
import uiBootstrap from 'angular-ui-bootstrap';
import ngResource from 'angular-resource';
import uiRouter from '@uirouter/angularjs';

// Modules
import allModules from './config/lib/all.modules';

// Main app module configuration and startup
angular
  .module('myapp', [ngResource, ngAnimate, ngMessages, ngRoute, ngSanitize, uiRouter, uiBootstrap, ...allModules])
  .config(bootstrapConfig);

angular.element(document).ready(function () {
  angular.bootstrap(document, ['myapp'], {
    ngStrictDI: true
  });
});

bootstrapConfig.$inject = ['$compileProvider', '$locationProvider', '$httpProvider', '$logProvider'];
function bootstrapConfig($compileProvider, $locationProvider, $httpProvider, $logProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  }).hashPrefix('!');

  $httpProvider.interceptors.push('authInterceptor');

  // Disable debug data for production environment
  // @link https://docs.angularjs.org/guide/production
  $compileProvider.debugInfoEnabled(window.env !== 'production');
  $logProvider.debugEnabled(window.env !== 'production');
}
