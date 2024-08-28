UsersListController.$inject = ['$window', 'Authentication', 'Notification', 'allUsers'];

export default function UsersListController($window, Authentication, Notification, allUsers) {
  var vm = this;
  vm.authentication = Authentication;
  vm.users = allUsers;
  vm.admins = vm.users.filter(user => user.roles[0] === 'admin' || user.roles[0] === 'superAdmin');
  vm.remove = function remove(user) {
    if ($window.confirm('Are you sure you want to remove this admin user?')) {
      user.roles = ['user'];
      user.$update()
        .then(successCallback)
        .catch(errorCallback);
    }

    function successCallback() {
      vm.admins.splice(vm.admins.indexOf(user), 1);
      Notification.success({ message: `<i class="glyphicon glyphicon-ok"></i> User ${user.username} is no longer an admin user!` });
    }

    function errorCallback(res) {
      Notification.error({
        message: res.data.message,
        title: `<i class="glyphicon glyphicon-remove"></i> User ${user.username} operation failed!!`
      });
    }
  };
}
