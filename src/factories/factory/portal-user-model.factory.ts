import { PortalUser } from '../../domain/entity/portal-user.entity';
import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { AuthenticationUtils } from '../../common/utils/authentication-utils.service';
import { GenderConstant } from '../../domain/enums/gender-constant';


export class PortalUserModelFactory implements FactoryHelper<PortalUser> {

  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<PortalUser> {
    const portalUser = new PortalUser();
    portalUser.lastName = faker.name.lastName();
    portalUser.firstName = faker.name.firstName();
    portalUser.lastName = faker.name.lastName();
    portalUser.phoneNumber = faker.phone.phoneNumber();
    portalUser.password = await (new AuthenticationUtils()).hashPassword(faker.random.uuid());
    portalUser.gender = faker.random.arrayElement(Object.values(GenderConstant));
    portalUser.email = faker.internet.email().toLowerCase();
    portalUser.username = portalUser.email.toLocaleLowerCase();

    return portalUser;

  }

}