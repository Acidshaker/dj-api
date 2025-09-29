declare module '@adminjs/sequelize' {
  import { BaseResource, BaseDatabase } from 'adminjs';
  import { Sequelize } from 'sequelize';

  export class Database extends BaseDatabase {
    constructor(sequelize: Sequelize);
  }

  export class Resource extends BaseResource {
    constructor(model: any);
  }
}
