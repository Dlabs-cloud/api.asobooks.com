export interface EntityFactoryBuilder<T> {

    create(): Promise<T>;

    createMany(count: number): Promise<T[]>;

    makeMany(count: number): Promise<T[]>

    make(): Promise<T>;

    use(callBack: (t: T) => T): EntityFactoryBuilder<T>;
}

