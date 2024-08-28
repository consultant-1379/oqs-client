var $ = require('jquery');
require('datatables')();
ConfigurationsListController.$inject = ['$window', '$scope', '$compile', 'Notification', 'configurations'];

export default function ConfigurationsListController($window, $scope, $compile, Notification, configurations) {
  var vm = this;
  vm.allConfigurations = configurations;
  function refreshAllTables() {
    $('.table').each(function () {
      if ($.fn.DataTable.isDataTable(this)) {
        $(this).dataTable().fnDestroy();
      }
    });

    prepareTable('#configuration-table', vm.allConfigurations);
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
        title: 'Pod Load Tolerance',
        data: null,
        render: function (data) {
          return `<strong class="text-shadow">${data.defaultPodLoadTolerance}</strong>`;
        }
      },
      {
        title: 'Product Types',
        data: null,
        render: function (data) {
          var productList = [];
          if (data.products) {
            data.products.forEach(function (product) {
              productList.push(product.name);
            });
          }
          return `${productList}`;
        }
      },
      {
        title: 'Actions',
        width: '175px',
        orderable: false,
        searchable: false,
        data: null,
        render: function (data) {
          var viewElement = `<a class="btn btn-sm btn-info" ui-sref="configurations.view({ configurationId: '${data._id}' })">View</a>`;
          var compiledView = $compile(viewElement)($scope)[0].outerHTML;
          var editElement = `<a class="btn btn-sm btn-primary" ui-sref="configurations.edit({ configurationId: '${data._id}' })">Edit</a>`;
          var compiledEdit = $compile(editElement)($scope)[0].outerHTML;
          return `${compiledView}&nbsp;${compiledEdit}`;
        }
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
      rowCallback: function (row) {
        $('td', row).addClass('bg-success');
      }
    });

    $('.table').on('click', '.delete-button', function (e) {
      e.stopPropagation();
      var tr = $(this).parents('tr');
      var row = table.api().row(tr);
      var artifact = row.data();

      if ($window.confirm('Are you sure you want to delete this Configuration?')) {
        artifact.$delete()
          .then(successCallback)
          .catch(errorCallback);
      }

      function successCallback() {
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Configuration deleted successfully!' });
        row.remove().draw();
      }

      function errorCallback(res) {
        var message = res.data ? res.data.message : res.message;
        Notification.error({
          message: message.replace(/\n/g, '<br/>'),
          title: '<i class="glyphicon glyphicon-remove"></i> Configuration deletion failed!',
          delay: 7000
        });
      }
    });
  }

  $(function () {
    refreshAllTables();
  });
}
