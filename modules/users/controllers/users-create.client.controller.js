UsersCreateController.$inject = ['$scope', '$state', 'allUsers', 'Notification', 'Authentication'];

export default function UsersCreateController($scope, $state, allUsers, Notification, Authentication) {
  var vm = this;
  var loggedInUser = Authentication.user;
  vm.users = allUsers;

  vm.submitForm = async function () {
    try {
      vm.formSubmitting = true;
      if (loggedInUser.username === vm.user.name) {
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Role Update of Current User Not Allowed!' });
        return;
      }
      if (isUserInDB(vm.user.name)) {
        var user = await vm.users.filter(user => user.username === vm.user.name)[0];
        if (vm.adminType) user.roles = [vm.adminType];
        await user.$update();
      }
    } catch (err) {
      vm.formSubmitting = false;
      var message = err.data ? err.data.message : err.message;
      Notification.error({ message: message, title: '<i class="glyphicon glyphicon-remove"></i> Admin creation error!' });
      return;
    }
    $state.go('users.list');
    Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Admin creation successful!' });
  };

  function isUserInDB(username) {
    for (var index in allUsers) {
      if (allUsers[index].username === username) {
        return true;
      }
    }
    var message = 'Username not in database. User must have logged in once before they can be added as an admin.';
    throw new Error(message);
  }
}
