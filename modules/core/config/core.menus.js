menuConfig.$inject = ['menuService'];
export default function menuConfig(menuService) {
  menuService.addMenu('account', {
    roles: ['user']
  });

  menuService.addMenuItem('account', {
    title: '',
    state: 'settings',
    type: 'dropdown',
    roles: ['user']
  });
}
