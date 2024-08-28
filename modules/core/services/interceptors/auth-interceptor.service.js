authInterceptor.$inject = ['$q', '$injector'];

export default function authInterceptor($q, $injector) {
  var service = {
    responseError: responseError
  };
  return service;

  function responseError(rejection) {
    var Notification = $injector.get('Notification');
    if (!rejection.config.ignoreAuthModule) {
      switch (rejection.status) {
        case 401:
          $injector.get('$state').transitionTo('authentication.signin');
          Notification.error({
            message: 'You are unauthorized to view this page.',
            title: 'Login to continue!',
            delay: 5000
          });
          break;
        case 403:
          $injector.get('$state').transitionTo('forbidden');
          break;
        case 404:
          $injector.get('$state').go('not-found', { message: rejection.data.message });
          break;
        case -1:
          Notification.error({
            message: 'No response received from server. Please try again later.',
            title: 'Error processing request!',
            delay: 5000
          });
          break;
        default:
          break;
      }
    }
    return $q.reject(rejection);
  }
}
