import { User } from './User';
import { Role } from './Role';
import { Event } from './Event';
import { CompanyData } from './CompanyData';
import { EventMusic } from './EventMusic';
import { Music } from './Music';
import { Subscription } from './Subscription';
import { Plan } from './Plan';
import { PasswordResetToken } from './PasswordResetToken';
import { EmailVerificationToken } from './EmailVerificationToken';
import { EventPackage } from './EventPackage';
import { Mention } from './Mention';
import { Group } from './Group';

//
// 🔗 Usuario
//
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

User.hasMany(Event, { foreignKey: 'userId' });
Event.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CompanyData, { foreignKey: 'userId' });
CompanyData.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PasswordResetToken, { foreignKey: 'userId' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(EmailVerificationToken, {
  foreignKey: 'userId',
  as: 'emailVerificationTokens',
  onDelete: 'CASCADE',
});
EmailVerificationToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

//
// 🔗 Evento
//
Event.hasMany(EventMusic, { foreignKey: 'eventId', as: 'eventMusics' });
EventMusic.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Event.belongsTo(CompanyData, { foreignKey: 'companyDataId' });
CompanyData.hasMany(Event, { foreignKey: 'companyDataId' });

Event.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
Group.hasMany(Event, { foreignKey: 'groupId', as: 'events' });

// Event.belongsTo(ListEventMusic, {
//   foreignKey: 'listEventMusicId',
//   as: 'listEventMusic',
// });

// ListEventMusic.hasMany(Event, {
//   foreignKey: 'listEventMusicId',
//   as: 'events',
// });

//
// 🔗 EventMusic
//
EventMusic.hasOne(Music, { foreignKey: 'eventMusicId', as: 'music' });
Music.belongsTo(EventMusic, { foreignKey: 'eventMusicId', as: 'eventMusic' });

EventMusic.hasOne(Mention, { foreignKey: 'eventMusicId', as: 'mention' });
Mention.belongsTo(EventMusic, { foreignKey: 'eventMusicId', as: 'eventMusic' });

//
// 🔗 Suscripcion
//

User.hasOne(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

//
// 🔗 Plan
//

Plan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

//
// 🔗 Lista de paquetes de eventos
//

Group.belongsToMany(EventPackage, {
  through: 'GroupEventPackages',
  foreignKey: 'groupId',
  otherKey: 'eventPackageId',
  as: 'eventPackages',
});

EventPackage.belongsToMany(Group, {
  through: 'GroupEventPackages',
  foreignKey: 'eventPackageId',
  otherKey: 'groupId',
  as: 'groups',
});
