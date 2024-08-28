AuthenticationController.$inject = ['$scope', '$state', 'UsersService', 'Authentication', 'Notification'];

export default function AuthenticationController($scope, $state, UsersService, Authentication, Notification) {
  var vm = this;
  vm.authentication = Authentication;
  (async function () {
    await vm.authentication.updateUser();

    if (vm.authentication.user !== undefined) {
      sendUserToRequestedPage();
    }

    vm.signin = signin;
    function signin(isValid) {
      UsersService.userSignin(vm.credentials)
        .then(onUserSigninSuccess)
        .catch(onUserSigninError);
    }

    function onUserSigninSuccess(response) {
      vm.authentication.user = response;
      Notification.info({ message: 'Welcome ' + response.firstName });
      sendUserToRequestedPage();
    }

    function sendUserToRequestedPage() {
      if ($state.previous && $state.previous.to && $state.previous.to.name !== 'authentication.signin') {
        $state.go($state.previous.to.name, $state.previous.params);
      } else {
        $state.go('home');
      }
    }

    function onUserSigninError(response) {
      Notification.error({
        message: 'Failed to sign-in.',
        title: '<i class="glyphicon glyphicon-remove"></i> Signin Error!',
        delay: 6000
      });
    }
  }());
}
