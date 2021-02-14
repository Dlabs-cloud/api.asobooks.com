import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { SubscriptionRepository } from '../dao/subscription.repository';
import { BillRepository } from '../dao/bill.repository';
import { MembershipRepository } from '../dao/membership.repository';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PaymentRequestRepository } from '../dao/payment-request.repository';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';
import { mockPaymentTransactions } from '../test/test-utils';
import { BillInvoiceRepository } from '../dao/bill-invoice.repository';

@Controller('subscription')
@AssociationContext()
export class SubscriptionController {

  constructor(private readonly connection: Connection) {
  }

  @Get(':code')
  get(@Param('code')code: string,
      @Query()query: BillSearchQueryDto,
      @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection
      .getCustomRepository(SubscriptionRepository)
      .findOne({ code: code }).then(subscription => {
        if (!subscription) {
          throw new NotFoundException(`Subscription with code ${code} cannot be found`);
        }
        return this.connection.getCustomRepository(BillRepository)
          .findBySubscriptionAndQuery(subscription, query)
          .then(billsAndCount => {
            const bills = billsAndCount[0];
            return this.connection
              .getCustomRepository(MembershipRepository)
              .findByBills(bills)
              .then(memberships => {
                return this.connection.getCustomRepository(PortalUserRepository)
                  .findByMemberships(memberships)
                  .then(portalUsers => {
                    memberships.forEach(membership => {
                      membership.portalUser = portalUsers.find(portalUser => portalUser.id === membership.portalUserId);
                    });
                    return Promise.resolve(memberships);
                  }).then(memberships => {
                    return this.connection
                      .getCustomRepository(BillInvoiceRepository)
                      .findByBills(bills)
                      .then(billInvoices => {
                        const invoices = billInvoices.map(billInvoice => billInvoice.invoice);
                        this.connection.getCustomRepository(PaymentRequestRepository)
                          .findByInvoices(invoices)
                          .then(paymentRequests => {
                            this.connection.getCustomRepository(PaymentTransactionRepository)
                              .findByPaymentRequests(paymentRequests)
                          })
                      })

                  });
              }).then(memberships => {
              });
          });
      });
  }
}