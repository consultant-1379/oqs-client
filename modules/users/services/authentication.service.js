Authentication.$inject = ['$http', 'Notification'];

export default function Authentication($http, Notification) {
  var auth = {
    user: undefined,
    signout: async function () {
      await signoutUser();
    },
    updateUser: async function () {
      await refreshUser();
    }
  };

  async function signoutUser() {
    $http.get('/api/auth/signout')
      .then(function successCallback() {
        auth.user = undefined;
        global.location.reload();
      }, function errorCallback() {
        Notification.error({
          message: 'Failed to sign out...',
          title: '<i class="glyphicon glyphicon-remove"></i>Error!'
        });
      });
  }

  async function refreshUser() {
    auth.user = undefined;
    await $http.get('/api/auth/checkForSession')
      .then(function successCallback(response) {
        if (response.status === 200 && response.data.isValid) {
          auth.user = response.data;
        }
      }, function errorCallback(response) {
        Notification.error({
          message: 'Failed to sign in...',
          title: '<i class="glyphicon glyphicon-remove"></i>Error!'
        });
      });
  }
  return auth;
}
