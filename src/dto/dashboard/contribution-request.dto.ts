import {IsNotEmpty} from "class-validator";

export class ContributionRequestDto {
    @IsNotEmpty()
    year: number
}