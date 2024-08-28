var $ = require('jquery');
require('datatables')();

HistoryListController.$inject = ['$scope', '$compile', '$stateParams', 'logs'];
export default function HistoryListController($scope, $compile, $stateParams, logs) {
  var vm = this;

  var objectType = $stateParams.objType;
  vm.objectHeader = objectType.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); });

  function refreshAllTables() {
    $('.table').each(function () {
      if ($.fn.DataTable.isDataTable(this)) {
        $(this).dataTable().fnDestroy();
      }
    });

    var liveLogs = [];
    var deletedLogs = [];

    if (logs && logs.length) {
      logs = getLogsWithCurrentNames(logs);
      liveLogs = logs.filter(function (log) {
        var data = !Object.keys(log).includes('deletedBy');
        return data;
      });

      deletedLogs = logs.filter(function (log) {
        var data = Object.keys(log).includes('deletedBy');
        return data;
      });

      prepareTable('#live-table', liveLogs, 'Modified');
      prepareTable('#deleted-table', deletedLogs, 'Deleted');
    }
  }

  function prepareTable(tableId, dataSource, uniqueHeader) {
    $(tableId).dataTable({
      data: dataSource,
      columns: [{
        title: 'ID',
        data: 'associated_id'
      },
      {
        title: 'Name',
        data: null,
        render: function (data) {
          var origData = data.originalData;
          var stringBuilder = '<strong>' + origData.name;
          return stringBuilder + '</strong>';
        }
      },
      {
        title: 'Created At',
        data: null,
        render: function (data) {
          return formatDate(data.createdAt);
        }
      },
      {
        title: 'Created By',
        data: null,
        render: function (data) {
          var user = data.createdBy;

          if (typeof user === 'string') {
            return user;
          }
          return generateEmailLink(objectType, data.originalData.name, user);
        }
      },
      {
        title: uniqueHeader + ' At',
        data: null,
        render: function (data) {
          if (data.deletedAt) {
            return formatDate(data.deletedAt);
          } else if (data.updates.length) {
            return formatDate(data.updates[data.updates.length - 1].updatedAt);
          }
          return formatDate(data.createdAt);
        }
      },
      {
        title: uniqueHeader + ' By',
        data: null,
        render: function (data) {
          var user;
          if (data.deletedBy) {
            user = data.deletedBy;
          } else if (data.updates.length !== 0) {
            user = data.updates[data.updates.length - 1].updatedBy;
          } else {
            user = data.createdBy;
          }

          if (typeof user === 'string') {
            return user;
          }
          return generateEmailLink(objectType, data.originalData.name, user);
        }
      },
      {
        title: 'Action',
        orderable: false,
        searchable: false,
        data: null,
        render: function (data) {
          var viewElement =
          `<a class="btn btn-sm btn-info" ui-sref="history.view({objType: '${objectType}', objId: '${data.associated_id}' })">View</a>`;
          var compiledView = $compile(viewElement)($scope)[0].outerHTML;
          return compiledView;
        }
      }
      ],
      order: [[1, 'asc']],
      columnDefs: [{
        defaultContent: '-',
        targets: '_all'
      }
      ],
      sDom: 'Brti',
      paging: false,
      paginate: true,
      scrollY: 350,
      deferRender: true,
      scroller: true,
      info: false,
      bLengthChange: false,
      searching: true
    });
  }

  $(function () {
    refreshAllTables();
    $('#filter-field').on('keyup click', () => filterAllTables($('#filter-field').val()));
  });
}

function getLogsWithCurrentNames(logs) {
  var logsWithCurrentName = logs.map(function (log) {
    log.currentName = log.originalData.name;
    for (var i = log.updates.length - 1; i >= 0; i -= 1) {
      if (log.updates[i] && log.updates[i].updateData.name) {
        log.currentName = log.updates[i].updateData.name;
        break;
      }
    }
    return log;
  });
  return logsWithCurrentName;
}

function generateEmailLink(objectType, objectName, user) {
  var subject = 'OQS Query Regarding ' + objectType + ' Object: ' + objectName;
  return '<a href="mailto:' + user.email + '?Subject=' + subject + '"><strong>&#9993;</strong>&nbsp;' + user.displayName + ' (' + user.username.toUpperCase() + ')</a>';
}

function formatDate(oldDateString) {
  if (oldDateString.startsWith('1970')) return 'UNKNOWN DATE';
  var dateAndTime = new Date(oldDateString).toISOString().split('T');
  var time = dateAndTime[1].split(':');
  return `${dateAndTime[0]}, ${time[0]}:${time[1]}`;
}

function filterAllTables(value) {
  $('.table').DataTable().search(value).draw(); // eslint-disable-line new-cap
}
