import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { File } from '../domain/entity/file.entity';

@EntityRepository(File)
export class FileRepository extends BaseRepository<File> {

}