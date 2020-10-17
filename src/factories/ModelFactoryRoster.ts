import { ModelFactory } from '../common/test-starter/orm-faker/contracts/ModelFactory';
import { Setting } from '../domain/entity/setting.entity';
import { SettingModelFactory } from './factory/setting-model.factory';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalUserModelFactory } from './factory/portal-user-model.factory';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalAccountModelFactory } from './factory/portal-account-model.factory';
import { Membership } from '../domain/entity/membership.entity';
import { MembershipModelFactory } from './factory/membership-model.factory';
import { FileModelFactory } from './factory/file-model.factory';
import { File } from '../domain/entity/file.entity';
import { Address } from '../domain/entity/address.entity';
import { AddressModelFactory } from './factory/address-model.factory';
import { Country } from '../domain/entity/country.entity';
import { CountryModelFactory } from './factory/country-model.factory';
import { Association } from '../domain/entity/association.entity';
import { AssociationModelFactory } from './factory/association-model.factory';
import { Bank } from '../domain/entity/bank.entity';
import { BankFactory } from './factory/bank.factory';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { ServiceFeeFactory } from './factory/service-fee.factory';
import { Group } from '../domain/entity/group.entity';
import { GroupModelFactory } from './factory/group-model.factory';
import { GroupMembership } from '../domain/entity/group-membership.entity';
import { MembershipGroupModelFactory } from './factory/membership-group-model.factory';
import { GroupServiceFee } from '../domain/entity/group-sevice-fee.entity';
import { GroupServiceFeeModelFactory } from './factory/group-service-fee-model.factory';
import { Subscription } from '../domain/entity/subcription.entity';
import { SubscriptionModelFactory } from './factory/subscription-model.factory';

export class ModelFactoryRoster {
  static register(modelFactory: ModelFactory) {
    modelFactory.register<Setting, SettingModelFactory>(Setting, SettingModelFactory);
    modelFactory.register<PortalUser, PortalUserModelFactory>(PortalUser, PortalUserModelFactory);
    modelFactory.register(PortalAccount, PortalAccountModelFactory);
    modelFactory.register(Membership, MembershipModelFactory);
    modelFactory.register(File, FileModelFactory);
    modelFactory.register(Address, AddressModelFactory);
    modelFactory.register(Country, CountryModelFactory);
    modelFactory.register(Association, AssociationModelFactory);
    modelFactory.register(Bank, BankFactory);
    modelFactory.register(Group, GroupModelFactory);
    modelFactory.register(ServiceFee, ServiceFeeFactory);
    modelFactory.register(GroupMembership, MembershipGroupModelFactory);
    modelFactory.register(GroupServiceFee, GroupServiceFeeModelFactory);
    modelFactory.register(Subscription, SubscriptionModelFactory);
  }
}
