import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { FileResource } from '../../domain/entity/file.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { FileTypeConstant } from '../../domain/enums/file-type-constant';

export class FileModelFactory implements FactoryHelper<FileResource> {
  apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<FileResource> {
    const file = new FileResource();
    file.servingUrl = faker.image.imageUrl();
    file.hostIdentifier = faker.random.uuid();
    file.type = faker.random.arrayElement(Object.values(FileTypeConstant));
    file.contentType = faker.image.image();
    file.name = faker.image.technics();
    return Promise.resolve(file);
  }

}