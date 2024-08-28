import { getProductLoadValue, getPercentLoad } from '../../core/controllers/helpers.controller';
var $ = require('jquery');
require('datatables')();

PodsListController.$inject = ['$timeout', '$stateParams', '$state', '$scope',
  '$compile', '$window', 'Notification', 'Authentication', 'pods', 'deployments'];

export default function PodsListController(
  $timeout, $stateParams, $state, $scope,
  $compile, $window, Notification, Authentication, pods, deployments
) {
  var vm = this;
  vm.allPods = [];
  var auth = Authentication;

  pods.forEach(pod => {
    var currentPodLoad = 0;
    var childDepls = deployments.filter(depl => depl.associatedPod === pod.name);
    pod.activeDeployments = childDepls.filter(depl => depl.queueStatus === 'Active');
    pod.queuedDeplCount = childDepls.filter(depl => depl.queueStatus === 'Queued').length;
    if (pod.activeDeployments.length !== 0) {
      pod.activeDeployments.forEach(function (depl) {
        currentPodLoad += getProductLoadValue(pod, depl.product);
      });
    }
    pod.currentPodLoad = currentPodLoad;
    pod.percentLoad = getPercentLoad(pod);
    vm.allPods.push(pod);
  });

  vm.activePods = vm.allPods;

  vm.selectRadiatorView = function (viewSelect) {
    $('.tablinks').removeClass('active');
    $(`#${viewSelect}`).addClass('active');
    if ($stateParams.activePods && $stateParams.activePods.length) {
      var podsFromRefresh = $stateParams.activePods;
      vm.activePods = vm.allPods.filter(pod => podsFromRefresh.includes(pod.name));
    }

    if (viewSelect !== 'showAll') {
      $('#addPodsToCustomView').show();
      var modal = document.getElementById('podsModal');
      var closeButton = document.getElementsByClassName('close')[0];

      vm.filterPodsModal = function () {
        modal.style.display = 'block';
        vm.activePods = [];
        $('.pods').each(function () {
          var currentPod = $(this);
          if (currentPod.hasClass('bg-danger')) currentPod.removeClass('bg-danger').addClass('bg-success');
        });
      };

      closeButton.onclick = function () {
        modal.style.display = 'none';
      };

      vm.addFilteredPods = function (podId) {
        var podCard = $(`#pod\\(${podId}\\)`);
        var addPod = (podCard.hasClass('bg-success'));
        var addClass = (addPod) ? 'bg-danger' : 'bg-success';
        var removeClass = (addPod) ? 'bg-success' : 'bg-danger';

        if (addPod) vm.activePods.push(vm.allPods.find(pod => pod._id === podId));
        else vm.activePods = vm.activePods.filter(pod => pod._id !== podId);
        podCard.addClass(addClass).removeClass(removeClass);
      };

      window.onclick = function (event) {
        if (event.target === modal) modal.style.display = 'none';
      };
    } else {
      $('#addPodsToCustomView').hide();
      vm.activePods = vm.allPods;
    }
    $timeout(function () {
      refreshAllTables();
    });
  };

  function refreshAllTables() {
    $('.table').each(function () {
      if ($.fn.DataTable.isDataTable(this)) {
        $(this).dataTable().fnDestroy();
      }
    });

    var queueEnabledList = [];
    var queueDisabledList = [];

    if (vm.activePods && vm.activePods.length) {
      vm.activePods.forEach(function (pod) {
        if (pod.queueEnabled) {
          queueEnabledList.push(pod);
        } else {
          queueDisabledList.push(pod);
        }
      });

      prepareTable('#enabled-table', queueEnabledList);
      prepareTable('#disabled-table', queueDisabledList);
    }
  }
  function prepareTable(tableId, dataSource) {
    var table = $(tableId).dataTable({
      data: dataSource,
      columns: [{
        title: 'Name',
        data: null,
        render: function (data) {
          return `<strong class="text-shadow">${data.name}</strong>`;
        }
      },
      {
        title: 'Products Queued',
        data: null,
        render: function (data) {
          return `<strong class="text-shadow">${data.productType}</strong>`;
        }
      },
      {
        title: 'Current / Maximum Tolerance',
        data: null,
        render: function (data) {
          var currentPodLoad = (data.currentPodLoad) ? data.currentPodLoad : 0;
          return `${currentPodLoad}/${data.podLoadTolerance} (${data.percentLoad}%)`;
        }
      },
      {
        title: 'Actions',
        width: '175px',
        orderable: false,
        searchable: false,
        data: null,
        render: function (data) {
          var viewElement = `<a class="btn btn-sm btn-info" ui-sref="pods.view({ podId: '${data._id}' })">View</a>`;
          var compiledView = $compile(viewElement)($scope)[0].outerHTML;
          var editElement = `<a class="btn btn-sm btn-primary" ui-sref="pods.edit({ podId: '${data._id}' })">Edit</a>`;
          var compiledEdit = $compile(editElement)($scope)[0].outerHTML;
          var actions = compiledView;
          if (vm.userIsAdmin) {
            var deleteElement = '<a class="delete-button btn btn-sm btn-danger">Delete</a>';
            actions = `${compiledView}&nbsp;${compiledEdit}&nbsp;${deleteElement}`;
          }
          return actions;
        }
      }
      ],
      order: [[2, 'asc']],
      columnDefs: [{
        defaultContent: '-',
        targets: '_all'
      }
      ],
      sDom: 'Brti',
      paging: false,
      paginate: true,
      deferRender: true,
      scroller: true,
      info: false,
      bLengthChange: false,
      searching: true,

      rowCallback: function (row, data, index) {
        var trClass;
        if (!data.queueEnabled) {
          trClass = 'bg-secondary';
        } else if (data.percentLoad <= 70) {
          trClass = 'bg-success';
        } else if (data.percentLoad > 70 && data.percentLoad < 90) {
          trClass = 'bg-warningCustom';
        } else {
          trClass = 'bg-danger';
        }
        $('td', row).addClass(trClass);
        $(row).addClass('pod-row');
      }
    });

    setOnClickTBodyAndDeleteButton('#enabled-table');
    setOnClickTBodyAndDeleteButton('#disabled-table');
  }

  function setOnClickTBodyAndDeleteButton(tableId) {
    $(tableId).on('click', '.delete-button', function (e) {
      e.stopImmediatePropagation();
      var tr = $(this).parents('tr');
      var table = $(tableId).dataTable();
      var row = $(tableId).dataTable().api().row(tr);
      var pod = row.data();
      var displayName = pod.name;
      if ($window.confirm('Are you sure you want to delete this Pod "' + displayName + '"?')) {
        pod.$delete()
          .then(successCallback)
          .catch(errorCallback);
      }

      function successCallback() {
        vm.activePods.splice(vm.activePods.indexOf(pod), 1);
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Pod "' + displayName + '" deleted successfully!' });
        row.remove().draw();
      }

      function errorCallback(res) {
        Notification.error({
          message: res.data.message.replace(/\n/g, '<br/>'),
          title: '<i class="glyphicon glyphicon-remove"></i> Pod "' + displayName + '" deletion failed!',
          delay: 7000
        });
      }
    });
    $(tableId).on('click', 'tbody tr', function () {
      var table = $(tableId).dataTable();
      var pod = table.api().row(this).data();
      $state.go('pods.view', { podId: pod._id });
    });
  }

  $(async function () {
    await auth.updateUser();
    var userLoggedIn = (auth.user && auth.user.roles[0]);
    if (userLoggedIn) vm.userIsAdmin = (auth.user.roles.includes('admin') || auth.user.roles.includes('superAdmin'));
    if (window.location.href.indexOf('list') > -1) {
      refreshAllTables();
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
    } else {
      vm.selectRadiatorView((!$stateParams.isCustomView) ? 'showAll' : 'customView');
    }
  });

  function filterAllTables(value) {
    $('#enabled-table').DataTable().search(value).draw(); // eslint-disable-line new-cap
  }
}
