import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { File } from '../../domain/entity/file.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';
import { FileTypeConstant } from '../../domain/enums/file-type-constant';

export class FileModelFactory implements FactoryHelper<File> {
  apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<File> {
    const file = new File();
    file.servingUrl = faker.image.imageUrl();
    file.hostIdentifier = faker.random.uuid();
    file.type = faker.random.arrayElement(Object.values(FileTypeConstant));
    file.contentType = faker.image.image();
    file.name = faker.image.technics();
    return Promise.resolve(file);
  }

}