export class ApiResponseDto<T> {

    private readonly data: T;

    private readonly message: string;

    private readonly code: number;

    constructor(data: T, code = 200, message = 'Successfully') {
        this.data = data;
        this.message = message;
        this.code = code;
    }

}