export interface OrmAdapter {
    save<T>(entity: T): Promise<T>;
}

