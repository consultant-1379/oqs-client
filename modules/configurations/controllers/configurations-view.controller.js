ConfigurationsViewController.$inject = ['configuration'];

export default function ConfigurationsViewController(configuration) {
  var vm = this;
  vm.configuration = configuration;
}
