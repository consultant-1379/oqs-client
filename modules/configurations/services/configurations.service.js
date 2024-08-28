ConfigurationsService.$inject = ['$resource', '$log'];

export default function ConfigurationsService($resource, $log) {
  var Configuration = $resource('/api/configurations/:configurationId', {
    configurationId: '@_id'
  }, {
    update: {
      method: 'PUT'
    }
  });

  angular.extend(Configuration.prototype, {
    createOrUpdate: function () {
      var configuration = this;
      return createOrUpdate(configuration);
    }
  });
  return Configuration;

  function createOrUpdate(configuration) {
    if (configuration._id) {
      return configuration.$update(onSuccess, onError);
    }
    return configuration.$save(onSuccess, onError);

    function onSuccess() {
    }

    function onError(errorResponse) {
      $log.error(errorResponse.data);
    }
  }
}
