var $ = require('jquery');

HeaderController.$inject = ['$state', '$scope', '$http', 'Authentication', 'menuService'];
export default function HeaderController($state, $scope, $http, Authentication, menuService) {
  var vm = this;
  vm.authentication = Authentication;
  (async function () {
    await vm.authentication.updateUser();

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);
    function stateChangeSuccess() {
      vm.isCollapsed = false;
    }

    // Retrieve OQS Tool Container Versions Info
    try {
      vm.versions = (await $http.get('/api/core/versions')).data;
    } catch (versionRetrievalError) {
      vm.versionsError = versionRetrievalError.data;
    }

    // Notification
    try {
      var toolNotifications = await $http.get('/api/core/toolnotifications');
      var notificationData = toolNotifications.data;
      if (notificationData) {
        var enabled = notificationData.enabled;
        $scope.hasNotification = enabled;
        if (enabled) {
          var notification = notificationData.notification;
          var jiraLink = notificationData.jira;
          var scrollClass = ((notification.length > 90 && !jiraLink) || (notification.length > 60 && jiraLink)) ? 'scroll-left' : 'non-scroll';
          $('#div-scroll').attr('class', scrollClass);
          $('#text-span').html((jiraLink) ? `${notification} <a target="_blank" class="btn btn-info small-btn-notification" href="${jiraLink}" role="button"> Issue Ref` : notification);
          $(`#${scrollClass}`).show();
        }
      }
      $scope.$apply();
    } catch (err) { console.log(err); } // eslint-disable-line no-console
    // Get information about upcoming upgrade and populate modal
    try {
      var upgradeToolResponse = await $http.get('/api/core/upgradeEmail'); // eslint-disable-line no-await-in-loop
      var latestUpgrade = upgradeToolResponse.data;
      var footer = $('#footerShow');
      if (latestUpgrade && !latestUpgrade.message) {
        // Populate footer and reduce 'content' container height
        footer.show();
        $('#footer-title,#upgrade-modal-title').each(function () { $(this).html(latestUpgrade.subject); });
        var refactoredUpgradeEmail = latestUpgrade.refactoredUpgradeEmail;
        $('#upgrade-email-message-body').html(refactoredUpgradeEmail);
      }
      if (latestUpgrade.message) footer.hide();
      $scope.$apply();
      // eslint-disable-next-line no-console
    } catch (err) { console.log(err); }
    // Find Upgrade Modal
    var upgradeModal = $('#upgrade-modal');
    $('#open-upgrade-modal').click(function () {
      upgradeModal.show();
      $scope.$apply();
    });

    $('#close-upgrade-modal').click(function () {
      upgradeModal.hide();
    });

    // When the user clicks anywhere outside of the modal, close it
    var docUpgradeModal = document.getElementById('upgrade-modal');
    window.onclick = function (event) {
      if (event.target === docUpgradeModal) upgradeModal.hide();
    };
  }());

  // Reload view state after 5 minutes of inactivity
  var reloadStateTimer;
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;
  function resetTimer() {
    clearTimeout(reloadStateTimer);
    reloadStateTimer = setTimeout(() => {
      var isCustomView = $('#customView').hasClass('active');
      var activePods = (isCustomView) ? [] : undefined;
      if (isCustomView) {
        $('.podName').each(function () {
          var currentPod = $(this).text().trim();
          activePods.push(currentPod);
        });
      }
      $state.go('.', { isCustomView: isCustomView, activePods: activePods }, { reload: true });
      resetTimer();
    }, 300000);
  }
}
