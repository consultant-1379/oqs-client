import _ from 'lodash';
var $ = require('jquery');
PodsCreateController.$inject = ['$window', '$scope', '$state', 'pod', 'configurations', 'creatingFromScratch', 'Notification'];

export default function PodsCreateController($window, $scope, $state, pod, configurations, creatingFromScratch, Notification) {
  var vm = this;
  vm.pod = pod;
  vm.configuration = configurations[0];
  var cssVisible = { visibility: 'visible', color: '#c31c15' };
  var cssHidden = { visibility: 'hidden', color: '#c31c15' };
  vm.productTypeNames = [];
  vm.productTypesSelected = {};

  populateProductTypesSelected();

  function populateProductTypesSelected() {
    var types = { All: false };

    if (!creatingFromScratch && vm.pod.products) {
      vm.pod.products.forEach(function (product) {
        types[product.name] = false;
      });
    }
    vm.configuration.products.forEach(function (product) {
      if (!types[product.name]) types[product.name] = false;
    });
    vm.productTypesSelected = types;
  }

  for (var i = 1; i < Object.keys(vm.productTypesSelected).length; i += 1) {
    vm.productTypeNames.push(Object.keys(vm.productTypesSelected)[i]);
  }

  if (creatingFromScratch) {
    vm.pageStatus = 'Creating Pod';
    $('#chk-option-error').css(cssVisible);
    // Initial pod products
    vm.pod.products = [];
    for (var j = 1; j < Object.keys(vm.productTypesSelected).length; j += 1) {
      vm.pod.products.push({ name: Object.keys(vm.productTypesSelected)[j], loadValue: 15, timeoutValue: 60 });
    }
  } else {
    vm.pageStatus = 'Editing Pod';
    $('#chk-option-error').css(cssHidden);
  }

  if (vm.pod.productType) {
    Object.keys(vm.productTypesSelected).forEach(function (key) {
      vm.pod.productType.forEach((item) => {
        if (key === item) vm.productTypesSelected[key] = true;
      });
    });
  }

  vm.optionSelected = function () {
    $('#chk-option-error').css(cssHidden);
  };

  vm.submitForm = async function () {
    var podStatus = (creatingFromScratch ? 'creation' : 'update');
    var podClone = _.cloneDeep(vm.pod);
    try {
      vm.formSubmitting = true;
      vm.pod.productType = Object.keys(vm.productTypesSelected).filter(key => (vm.productTypesSelected[key]));
      if (vm.pod.productType.length === 0) {
        vm.formSubmitting = false;
        Notification.error({ message: 'Must select at least one Queue Product option', title: '<i class="glyphicon glyphicon-remove"></i> Pod ' + podStatus + ' error!' });
        $('#chk-option-error').css(cssVisible);
        return;
      }
      await vm.pod.createOrUpdate();
    } catch (err) {
      vm.formSubmitting = false;
      Notification.error({ message: err.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Pod ' + podStatus + ' error!' });
      return;
    }
    if (podClone._id) {
      $state.go('pods.view', { podId: podClone._id });
    } else {
      $state.go('pods.list');
    }
    Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Pod ' + podStatus + ' successful!' });
  };

  vm.removePod = function (podToRemove) {
    if ($window.confirm('Are you sure you want to delete this pod?')) {
      podToRemove.$delete()
        .then(successCallback)
        .catch(errorCallback);
    }

    function successCallback() {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Pod "' + podToRemove.name + '" deleted successfully!' });
      $state.go('pods.list');
    }

    function errorCallback(res) {
      Notification.error({
        message: res.data.message,
        title: '<i class="glyphicon glyphicon-remove"></i> Pod "' + podToRemove.name + '" deletion failed!!'
      });
    }
  };
}
