import {IsNotEmpty} from "class-validator";

export class ContributionFilterDto {
    @IsNotEmpty()
    year: number
}