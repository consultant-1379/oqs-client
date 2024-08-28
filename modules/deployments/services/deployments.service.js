DeploymentsService.$inject = ['$resource', '$log'];

export default function DeploymentsService($resource, $log) {
  var Deployment = $resource('/api/deployments/:deplId', {
    deplId: '@_id'
  }, {
    update: {
      method: 'PUT'
    }
  });

  angular.extend(Deployment.prototype, {
    createOrUpdate: function () {
      var dep = this;
      return createOrUpdate(dep);
    }
  });
  return {
    Deployment,
    Search: $resource('/api/deployments/search')
  };

  function createOrUpdate(dep) {
    if (dep._id) {
      return dep.$update(onSuccess, onError);
    }
    return dep.$save(onSuccess, onError);

    function onSuccess() {
    }

    function onError(errorResponse) {
      $log.error(errorResponse.data);
    }
  }
}
