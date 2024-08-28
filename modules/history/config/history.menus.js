menuConfig.$inject = ['menuService'];

export default function menuConfig(menuService) {
  menuService.addMenuItem('topbar', {
    title: 'Historical Logs',
    state: 'history',
    position: 1,
    roles: ['*'],
    type: 'dropdown'
  });
  menuService.addSubMenuItem('topbar', 'history', {
    title: 'Pod Logs',
    state: 'history.list',
    params: { objType: 'pods' },
    position: 1,
    roles: ['*']
  });
  menuService.addSubMenuItem('topbar', 'history', {
    title: 'Deployment Logs',
    state: 'history.list',
    params: { objType: 'deployments' },
    position: 2,
    roles: ['*']
  });
  menuService.addSubMenuItem('topbar', 'history', {
    title: 'Configuration Logs',
    state: 'history.list',
    params: { objType: 'configurations' },
    position: 3,
    roles: ['admin']
  });
}
