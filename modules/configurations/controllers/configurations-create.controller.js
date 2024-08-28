var http = require('http');
var $ = require('jquery');
PodsCreateController.$inject = ['$window', '$http', '$scope', '$state', 'configuration', 'pods', 'creatingFromScratch', 'Notification'];

export default function PodsCreateController($window, $http, $scope, $state, configuration, pods, creatingFromScratch, Notification) {
  var vm = this;
  vm.configuration = configuration;
  if (!vm.configuration.products) vm.configuration.products = [];
  vm.productTypesSelected = {
    All: false, cENM: false, vENM: false, CCD: false
  };
  vm.pageStatus = 'Creating Configuration';

  vm.submitForm = async function () {
    var configurationStatus = (creatingFromScratch ? 'creation' : 'update');
    try {
      vm.formSubmitting = true;
      await vm.configuration.createOrUpdate();
    } catch (err) {
      vm.formSubmitting = false;
      Notification.error({ message: err.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Configuration ' + configurationStatus + ' error!' });
      return;
    }
    // Update all pods
    await asyncForEach(pods, async function (pod) {
      await updatePod(pod._id);
    });

    $state.go('configurations.list');
    Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Configuration ' + configurationStatus + ' successful!' });
  };

  async function updatePod(podId) {
    var update = { randomUpdate: 0 };
    try {
      await $http({
        method: 'PUT',
        url: `/api/pods/${podId}`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      }).then(function (res) {
      }, function (err) {
        Notification.error({
          message: JSON.stringify(err),
          title: '<i class="glyphicon glyphicon-remove"></i> err!'
        });
      });
    } catch (requestError) {
      Notification.error({
        message: JSON.stringify(requestError),
        title: '<i class="glyphicon glyphicon-remove"></i> err!'
      });
    }
  }

  vm.addProduct = function () {
    vm.configuration.products.push({});
  };

  vm.removeProduct = function (prod) {
    var rowIndex = vm.configuration.products.indexOf(prod);
    if ($window.confirm(`Are you sure you want to delete this Product ${rowIndex + 1}: ${prod.name}?`)) {
      vm.configuration.products.splice(rowIndex, 1);
    }
  };

  async function asyncForEach(array, callBack) {
    for (var i = 0; i < array.length; i += 1) {
      await callBack(array[i], i, array); //eslint-disable-line
    }
  }
}
