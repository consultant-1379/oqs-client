UsersService.$inject = ['$resource'];

export default function UsersService($resource) {
  var Users = $resource('/api/users/:userId', {
    userId: '@_id'
  }, {
    update: {
      method: 'PUT'
    },
    signin: {
      method: 'POST',
      url: '/api/auth/signin'
    }
  });

  angular.extend(Users, {
    userSignin: function (credentials) {
      return this.signin(credentials).$promise;
    }
  });

  return Users;
}
