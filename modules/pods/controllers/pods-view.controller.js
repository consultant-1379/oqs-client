import _ from 'lodash';
import { asyncForEach, getProductLoadValue, getPercentLoad } from '../../core/controllers/helpers.controller';
var $ = require('jquery');
require('datatables')();
var moment = require('moment');

PodsViewController.$inject = ['$scope', '$state', '$window', 'pod', 'deployments', 'DeploymentsService', 'Notification', 'Authentication'];

export default function PodsViewController($scope, $state, $window, pod, deployments, DeploymentsService, Notification, Authentication) {
  var vm = this;
  vm.pod = pod;
  vm.deployments = deployments;
  var currentPodLoad = 0;
  var childDepls = vm.deployments.filter(depl => depl.associatedPod === vm.pod.name);
  vm.pod.activeDeployments = childDepls.filter(depl => depl.queueStatus === 'Active');
  if (vm.pod.activeDeployments.length !== 0) {
    vm.pod.activeDeployments.forEach(function (depl) {
      currentPodLoad += getProductLoadValue(vm.pod, depl.product);
    });
  }
  vm.pod.currentPodLoad = currentPodLoad;
  vm.pod.percentLoad = getPercentLoad(vm.pod);
  vm.productType = (pod.productType.length === 1) ? pod.productType.toString() : pod.productType.join(', ');
  vm.deployments.forEach(depl => initDeploymentInfo(vm.pod, depl));
  var viewDeploymentModal = document.getElementById('view-deployment-modal');
  vm.deploymentModal = [];
  vm.deployment = [];
  vm.statuses = ['Finished', 'Failed', 'Timed-Out'];
  vm.userIsAdmin = false;
  var auth = Authentication;
  var updateTableInterval = setInterval(() => {
    vm.deployments.forEach(depl => updateDeploymentInfo(depl));
    $scope.$digest();
  }, 1000);
  $scope.$on('$destroy', () => clearInterval(updateTableInterval));

  $scope.queuedDeploymentsFilter = (depl) => depl.queueStatus === 'Queued';
  $scope.activeDeploymentsFilter = (depl) => depl.queueStatus === 'Active';
  $scope.finishedOrFailedFilter = (depl) => depl.queueStatus !== 'Queued' && depl.queueStatus !== 'Active';

  vm.editDeploymentStatus = async function (deplId) {
    vm.deployment = await DeploymentsService.Deployment.get({ deplId: deplId }).$promise;
    vm.deploymentModal = _.cloneDeep(vm.deployment);
    delete vm.deploymentModal.queueStatus;
    vm.deploymentModal.productSetVersion = setProductSetVersion(vm.deploymentModal.productSet);
    viewDeploymentModal.style.display = 'block';
  };

  vm.closeModals = function () {
    viewDeploymentModal.style.display = 'none';
  };

  vm.submitDeploymentForm = async function () {
    try {
      vm.formSubmitting = true;
      vm.deployment.queueStatus = vm.deploymentModal.queueStatus;
      await vm.deployment.createOrUpdate();
    } catch (err) {
      vm.formSubmitting = false;
      Notification.error({ message: err.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Deployment Update error!' });
      return;
    }
    vm.closeModals();
    $state.go('pods.view', { podId: vm.pod._id }, { reload: true });
    Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Deployment update successful!' });
    refreshAllTables();
  };

  vm.deleteAllDeployments = async function () {
    if ($window.confirm('Are you sure you want to delete all Deployments from this Pod?')) {
      await asyncForEach(vm.pod.deployments, async function (deplName) {
        await vm.deleteDeployment(deplName, true);
      });
      $state.go('pods.view', { podId: vm.pod._id }, { reload: true });
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Deleted All Deployments successfully!' });
      refreshAllTables();
    }
  };

  vm.deleteDeployment = async function (deplName, skip = false) {
    var deployment = await vm.deployments.filter(depl => depl.name === deplName);
    deployment = await DeploymentsService.Deployment.get({ deplId: deployment[0]._id }).$promise;
    var displayName = deplName;
    var comfirm = skip;
    if (!skip) comfirm = $window.confirm('Are you sure you want to delete this Deployment "' + displayName + '"?');
    if (comfirm) {
      deployment.$delete()
        .then(successCallback)
        .catch(errorCallback);
    }
    function successCallback() {
      if (!skip) {
        $state.go('pods.view', { podId: vm.pod._id }, { reload: true });
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Deployment deletion successful!' });
        refreshAllTables();
      }
    }
    function errorCallback(res) {
      Notification.error({
        message: res.data.message.replace(/\n/g, '<br/>'),
        title: '<i class="glyphicon glyphicon-remove"></i> Deployment "' + displayName + '" deletion failed!',
        delay: 7000
      });
    }
  };

  // On Document Load, Run refreshAllTables()
  $(async function () {
    refreshAllTables();
    await auth.updateUser();
    var userLoggedIn = (auth.user && auth.user.roles[0]);
    if (userLoggedIn) vm.userIsAdmin = (auth.user.roles.includes('admin') || auth.user.roles.includes('superAdmin'));
    $('#filter-field').on('keyup click', () => filterAllTables($('#filter-field').val()));
    $('#filter-field').keyup(function () {
      $('.search-clear').toggle(Boolean($(this).val()));
    });
    $('.search-clear').toggle(Boolean($('#filter-field').val()));
    $('.search-clear').click(function () {
      $('#filter-field').val('').focus();
      $(this).hide();
      filterAllTables($('#filter-field').val());
    });
  });

  function filterAllTables(value) {
    $('#finished-deployments').DataTable().search(value).draw(); // eslint-disable-line new-cap
  }
}

function refreshAllTables() {
  $('#queued-deployments').each(function () { $(this).dataTable().fnDestroy(); });
  $('#active-deployments').each(function () { $(this).dataTable().fnDestroy(); });
  $('#finished-deployments').each(function () { $(this).dataTable().fnDestroy(); });

  prepareTable('#queued-deployments');
  prepareTable('#active-deployments');
  prepareTable('#finished-deployments');
}

function prepareTable(tableId) {
  $(tableId).dataTable({
    order: [[1, 'asc']],
    paginate: false,
    info: false,
    dom: 'Brtip',
    columnDefs: [
      { width: '20%', targets: [0, 4, 5] },
      { width: '10%', targets: [1, 2, 3] },
      { width: '08%', targets: [6] }
    ]
  });
}

function initDeploymentInfo(pod, depl) {
  depl.productSetVersion = setProductSetVersion(depl.productSet);
  // Format all time related fields for output.
  depl.queuingStartTimeFormatted = formatDate(depl.queuingStartTime);
  depl.queueStartDate = new Date(depl.queuingStartTime);
  if (depl.instanceRunningStartTime) {
    depl.runningStartTimeFormatted = formatDate(depl.instanceRunningStartTime);
    depl.instRunStartDate = new Date(depl.instanceRunningStartTime);
    depl.totalQueueTime = getTimeDifference(depl.queueStartDate, depl.instRunStartDate);
    depl.queuingDurationPrint = depl.totalQueueTime;

    if (!depl.instanceRunningFinishTime && !depl.customTimeout) {
      depl.instRunTimeoutDate = new Date(depl.instRunStartDate.getTime() + getProductTimeout(depl.product, pod));
    } else if (depl.customTimeout && depl.queueStatus === 'Active') {
      depl.instRunTimeoutDate = new Date(depl.instRunStartDate.getTime() + (depl.customTimeout * 60000));
    } else {
      depl.runningFinishTimeFormatted = formatDate(depl.instanceRunningFinishTime);
      depl.instRunFinishDate = new Date(depl.instanceRunningFinishTime);
      depl.runningDurationPrint = getTimeDifference(depl.instRunStartDate, depl.instRunFinishDate);
    }
  }
}

function getProductTimeout(productName, pod) {
  var timeoutValue;
  pod.products.forEach(function (product) {
    if (product.name === productName) timeoutValue = product.timeoutValue;
  });
  return timeoutValue * 60000;
}

function updateDeploymentInfo(depl) {
  if (!depl.totalQueueTime) {
    depl.queuingDurationPrint = getTimeDifference(depl.queueStartDate, new Date());
  }
  if (depl.instanceRunningStartTime && !depl.instRunFinishDate) {
    depl.runningDurationPrint = getTimeDifference(depl.instRunStartDate, new Date());
    depl.timeoutDurationPrint = getTimeDifference(new Date(), depl.instRunTimeoutDate);
  }
}

function formatDate(oldDateString) {
  var dateObj = new Date(oldDateString);
  return dateObj.toLocaleTimeString() + ', ' + moment(dateObj).format('DD/MM/YYYY');
}

function getTimeDifference(dateStart, dateFinish) {
  var timeDuration = (dateFinish.getTime() - dateStart.getTime()) / 1000;
  return formatTimeDifference(timeDuration);
}

function formatTimeDifference(duration) {
  duration = (duration > 0) ? Number(duration) : 0;
  var hrs = Math.floor(duration / 3600);
  var mins = Math.floor((duration % 3600) / 60);
  var secs = Math.floor((duration % 3600) % 60);

  mins = (mins < 10 ? '0' + mins : mins) + 'min:';
  secs = (secs < 10 ? '0' + secs : secs) + 'sec';
  if (hrs > 0) {
    hrs = (hrs < 10 ? '0' + hrs : hrs) + 'hr:';
    return hrs + mins + secs;
  }
  return mins + secs;
}

function setProductSetVersion(productSet) {
  var productSetVersion;
  if (productSet) {
    productSetVersion = productSet;
    if (productSet.includes('::')) {
      productSetVersion = productSet.split('::')[1];
    }
  }
  return productSetVersion;
}
