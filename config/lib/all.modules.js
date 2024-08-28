import { core } from '../../modules/core/core.module';
import { pods } from '../../modules/pods/pods.module';
import { deployments } from '../../modules/deployments/deployments.module';
import { history } from '../../modules/history/history.module';
import { users } from '../../modules/users/users.module';
import { configurations } from '../../modules/configurations/configurations.module';

export default [
  core,
  pods,
  deployments,
  history,
  users,
  configurations
];
