menuConfig.$inject = ['menuService'];

export default function menuConfig(menuService) {
  menuService.addMenuItem('topbar', {
    title: 'Pods',
    state: 'pods',
    position: 1,
    roles: ['*'],
    type: 'dropdown'
  });
  menuService.addSubMenuItem('topbar', 'pods', {
    title: 'List View',
    state: 'pods.list',
    position: 1,
    roles: ['*']
  });
  menuService.addSubMenuItem('topbar', 'pods', {
    title: 'Radiator View',
    state: 'pods.radiator',
    position: 2,
    roles: ['*']
  });
  menuService.addSubMenuItem('topbar', 'pods', {
    title: 'Create New Pod',
    state: 'pods.create',
    position: 3,
    roles: ['*']
  });
}
