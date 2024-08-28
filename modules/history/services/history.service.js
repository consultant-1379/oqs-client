exports.getService = function (type) {
  getHistoryService.$inject = ['$resource'];

  async function getHistoryService($resource) {
    var Log = await $resource('/api/logs/' + type + '/:objId', {
      objId: '@associated_id'
    });
    return Log;
  }
  return getHistoryService;
};
