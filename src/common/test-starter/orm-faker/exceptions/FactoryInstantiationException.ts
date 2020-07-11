export class FactoryInstantiationException extends Error {
    name: string;

    constructor(message: string) {
        super(message);
    };
}

