import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { FileResource } from '../domain/entity/file.entity';

@EntityRepository(FileResource)
export class FileRepository extends BaseRepository<FileResource> {

}