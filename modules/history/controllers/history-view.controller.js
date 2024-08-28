var _ = require('lodash');
var $ = require('jquery');
var moment = require('moment');

HistoryViewController.$inject = ['$stateParams', '$timeout', '$scope', 'log'];

export default function HistoryViewController($stateParams, $timeout, $scope, log) {
  var vm = this;
  var dateToEuropeanFormatOptions = {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
  };
  vm.log = parseLogData(log, false);
  vm.log.updates = sortOfLogData(_.cloneDeep(vm.log.updates));
  vm.convertToCamelCase = word => word.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); });
  vm.objectType = vm.convertToCamelCase($stateParams.objType.substring(0, $stateParams.objType.length - 1));
  vm.searchValue = '';

  vm.formatDate = function (oldDateString) {
    var dateObj = new Date(oldDateString);
    return `${dateObj.toLocaleString('en-GB', dateToEuropeanFormatOptions)}`;
  };

  vm.downloadJSONFile = function (jsonObj, fileName) {
    var el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonObj, null, '\t')));
    el.setAttribute('download', fileName);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  vm.toggleAllVisibility = () => $('[id^="update-table-"]').toggle(!$('#update-table-0').is(':visible'));

  vm.toggleVisibility = objectId => $('#' + objectId).toggle();

  vm.clearSearch = function () {
    vm.searchValue = '';
    updateVisibleLogs(false);
  };

  // search key/value name in search field
  vm.filterLogs = function (searchType) {
    if (vm.searchValue === '') searchType = false;
    updateVisibleLogs(searchType);
  };

  // update the visible log depends on search type
  function updateVisibleLogs(searchType) {
    $timeout(function () {
      vm.log = parseLogData(vm.log, searchType);
      vm.loadedUpdates = sortOfLogData(_.cloneDeep(vm.log.updates));
      vm.unloadedUpdates = [];
      $scope.finishedLoading = true;
      $scope.$apply();
    });
  }

  function parseLogData(log, searchType) {
    var currentData = _.cloneDeep(log.originalData);
    log.isCreatedLogVisible = (!searchType);
    log.isDeletedLogVisible = (!searchType);
    for (var i = 0; i < log.updates.length; i += 1) {
      log.updates[i].isVisible = (!searchType);
      getUpdateChanges(currentData, log.updates[i], searchType);
    }
    log.currentData = currentData;
    return log;
  }

  function getUpdateChanges(currentData, update, searchType) {
    update.changes = [];
    for (var key in update.updateData) {
      if (Object.prototype.hasOwnProperty.call(update.updateData, key)) {
        update.changes.push(getChange(update.updateData, currentData, key, searchType, update));
      }
    }
    update.currentData = _.cloneDeep(currentData);
  }

  function getChange(updateData, currentData, key, searchType, update) {
    var change = { name: key, origValue: currentData[key] };
    var originalValue = currentData[key];
    var updateValue = updateData[key];
    var searchValueFormated = (vm.searchValue) ? vm.searchValue.toLowerCase() : '';

    if (searchType && update.isVisible === false) {
      if (searchType === 'key' && key.toLowerCase() === searchValueFormated) update.isVisible = true;
      if (searchType === 'value') {
        var isDate = /\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])/.test(vm.searchValue);
        var updateValueFormated = updateValue.toString().toLowerCase();
        if (originalValue) originalValue = originalValue.toString().toLowerCase();
        var originalEqSearchVal = originalValue && ((isDate) ? originalValue.includes(searchValueFormated) : originalValue === searchValueFormated);
        var updateEqSearchVal = (isDate) ? updateValueFormated.includes(vm.searchValue) : updateValueFormated === searchValueFormated;
        update.isVisible = originalEqSearchVal || updateEqSearchVal;
      }
    }
    if (currentData[key] === undefined) change.origValue = 'UNDEFINED';
    else if (currentData[key].constructor === Array) {
      var updatedArray = _.cloneDeep(currentData[key]);
      var arrayChanges = updateData[key];
      for (var k in arrayChanges) {
        if (Object.prototype.hasOwnProperty.call(arrayChanges, k)) updatedArray[k] = (arrayChanges[k] !== 'REMOVED') ? arrayChanges[k] : null;
      }
      updatedArray = updatedArray.filter(x => x !== null);
      updateData[key] = updatedArray;
      change.removedValues = currentData[key].filter(x => !updatedArray.includes(x)); // eslint-disable-line no-loop-func
      change.addedValues = updatedArray.filter(x => !currentData[key].includes(x)); // eslint-disable-line no-loop-func
    }
    change.newValue = updateData[key];
    currentData[key] = change.newValue;
    return change;
  }

  function sortOfLogData(logUpdateData) {
    logUpdateData = logUpdateData.sort(function (left, right) {
      return moment.utc(right.updatedAt).diff(moment.utc(left.updatedAt));
    });
    return logUpdateData;
  }
}
