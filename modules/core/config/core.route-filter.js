routeFilter.$inject = ['$rootScope', '$state', 'Notification', 'Authentication', '$transitions'];
export default function routeFilter($rootScope, $state, Notification, Authentication, $transitions) {
  $transitions.onError({}, function () {
    $rootScope.transitioning = false;
  });

  $transitions.onBefore({}, async function (trans) {
    var auth = Authentication;
    await auth.updateUser();

    var userLoggedIn = (auth.user && auth.user.roles !== undefined);

    if (userLoggedIn) {
      if (trans.to().name === 'authentication.signin') {
        return trans.router.stateService.target('home');
      }
    } else if (!userLoggedIn) {
      if (trans.to().name === 'pods.create' || trans.to().name === 'pods.edit') {
        $state.previous = {
          to: Object.assign({}, trans.to()),
          params: Object.assign({}, trans.params())
        };
        Notification.error({
          message: 'You must be logged in to modify Pods.',
          title: '<i class="glyphicon glyphicon-remove"></i>Sign in!'
        });
        return trans.router.stateService.target('authentication.signin');
      }
    }

    if ((trans.to().name === 'configurations.list' || trans.to().name === 'configurations.create' || trans.to().name === 'pods.edit') && (!userLoggedIn || auth.user.roles[0] === 'user')) {
      $state.previous = {
        to: Object.assign({}, trans.to()),
        params: Object.assign({}, trans.params())
      };
      Notification.error({
        message: 'You must be an admin to view this page.',
        title: '<i class="glyphicon glyphicon-remove"></i>Not authenticated!'
      });
      return trans.router.stateService.target('home');
    }

    if ((trans.to().name === 'users.create') && (!userLoggedIn || auth.user.roles[0] !== 'superAdmin')) {
      $state.previous = {
        to: Object.assign({}, trans.to()),
        params: Object.assign({}, trans.params())
      };
      Notification.error({
        message: 'You must be a superAdmin to view this page.',
        title: '<i class="glyphicon glyphicon-remove"></i>Not authenticated!'
      });
      return trans.router.stateService.target('home');
    }
  });

  $transitions.onStart({}, function (trans) {
    $rootScope.transitioning = true;
  });

  $transitions.onSuccess({}, function (trans) {
    if ($state.previous && $state.previous.to) {
      $state.previous.from = Object.assign({}, trans.from());
    } else {
      $state.previous = {
        from: Object.assign({}, trans.from()),
        params: Object.assign({}, trans.params())
      };
    }
    $rootScope.transitioning = false;
  });
}
