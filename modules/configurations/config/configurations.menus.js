menuConfig.$inject = ['menuService'];

export default function menuConfig(menuService) {
  menuService.addMenuItem('topbar', {
    title: 'Configurations',
    state: 'configurations.list',
    position: 3,
    roles: ['admin', 'superAdmin']
  });
}
