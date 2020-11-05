import {Controller, Get, Query} from "@nestjs/common";
import {TransactionDto} from "../dto/dashboard/transaction.dto";
import {ActivityTypeConstant} from "../domain/enums/activity-type-constant";
import {ApiResponseDto} from "../dto/api-response.dto";
import {AssociationContext} from "../dlabs-nest-starter/security/annotations/association-context";
import {ContributionFilterDto} from "../dto/dashboard/contribution-filter.dto";

@AssociationContext()
@Controller('dashboard')
export class DashboardController {


    @Get('/dashboard')
    public dashboardMetrics() {
        const recentTransactions: Array<TransactionDto> = DashboardController.transactionPayload()

        const response = {
            metrics:
                {
                    countOfMembers: 0,
                    expectedDues: 0,
                    totalAmountReceived: 0,
                    walletBalance: 0,
                },
            'recentTransactions': recentTransactions

        }
        return new ApiResponseDto(response)

    }

    @Get('/contributions')
    public totalContributions(@Query() contributionRequestDto: ContributionFilterDto) {
        const response = {
            1: 200000,
            2: 200000,
            3: 40200000,
            4: 200000,
            5: 60200000,
            6: 70200000,
            7: 80200000,
            8: 60200000,
            9: 75200000,
            10: 93200000,
            11: 30200000,
            12: 200000
        }
        return new ApiResponseDto(response)
    }

    @Get('recent-activities')
    public recentActivities() {
        const response = [
            {
                activity: 'string',
                activityType: ActivityTypeConstant.TRANSACTION,
                dateCreated: '2020-09-05T17:44:53.607Z'
            }
        ]
        return new ApiResponseDto(response);
    }

    private static transactionPayload() {
        return [
            {
                paidBy: 'Awwal',
                identificationNumber: 'RA123',
                amount: 1234,
                timeOfPayment: 'Tuesday 2020',
                feePaid: 'Electricity',
                receiptNumber: 'BN3674h'
            },
            {
                paidBy: 'Awwal',
                identificationNumber: 'RA123',
                amount: 1234,
                timeOfPayment: 'Tuesday 2020',
                feePaid: 'Electricity',
                receiptNumber: 'BN3674h'
            },
            {
                paidBy: 'Awwal',
                identificationNumber: 'RA123',
                amount: 1234,
                timeOfPayment: 'Tuesday 2020',
                feePaid: 'Electricity',
                receiptNumber: 'BN3674h'
            },
            {
                paidBy: 'Awwal',
                identificationNumber: 'RA123',
                amount: 1234,
                timeOfPayment: 'Tuesday 2020',
                feePaid: 'Electricity',
                receiptNumber: 'BN3674h'
            },
            {
                paidBy: 'Awwal',
                identificationNumber: 'RA123',
                amount: 1234,
                timeOfPayment: 'Tuesday 2020',
                feePaid: 'Electricity',
                receiptNumber: 'BN3674h'
            }
        ];
    }
}