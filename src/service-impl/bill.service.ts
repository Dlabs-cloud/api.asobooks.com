import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { Subscription } from '../domain/entity/subcription.entity';
import { Membership } from '../domain/entity/membership.entity';
import { Bill } from '../domain/entity/bill.entity';
import { BillCodeSequence } from '../core/sequenceGenerators/bill-code.sequence';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { BillRepository } from '../dao/bill.repository';
import { Invoice } from '../domain/entity/invoice.entity';
import { BillInvoiceRepository } from '../dao/bill-invoice.repository';
import { SubscriptionRepository } from '../dao/subscription.repository';

@Injectable()
export class BillService {


  constructor(private readonly connection: Connection, private readonly billCodeSequence: BillCodeSequence) {
  }


  updateBill(entityManager: EntityManager, paymentInvoice: Invoice) {
    return this.connection.getCustomRepository(BillInvoiceRepository)
      .findByInvoice(paymentInvoice).then(billInvoices => {
        return this.connection.getCustomRepository(BillRepository)
          .findByIds(billInvoices.map(billInvoice => billInvoice.billId))
          .then(bills => {
            const amountPaidPerBill = paymentInvoice.amountPaidInMinorUnit / bills.length;
            const promise = bills.map(bill => {
              bill.paymentStatus = paymentInvoice.paymentStatus;
              bill.datePaid = paymentInvoice.datePaid;
              bill.totalAmountPaidInMinorUnit = +amountPaidPerBill;
              return entityManager.save(bill).then(bill => {
                return this.connection.getCustomRepository(SubscriptionRepository)
                  .findOne({
                    id: bill.subscriptionId,
                  }).then(subscription => {
                    subscription.totalAmountPaid = Number(subscription.totalAmountPaid) + Number(bill.totalAmountPaidInMinorUnit);
                    subscription.totalPayableAmount = Number(subscription.totalPayableAmount) - Number(bill.totalAmountPaidInMinorUnit);
                    return entityManager.save(subscription);
                  });
              });
            });
            return Promise.all(promise);
          });
      });
  }

  createSubscriptionBill(subscription: Subscription, membership: Membership): Promise<Bill> {
    return this.connection.transaction(em => {
      return this.billCodeSequence
        .next()
        .then(sq => {
          let bill = new Bill();
          if (subscription.serviceType === ServiceTypeConstant.ONE_TIME) {
            bill.description = `Bill for ${subscription.serviceFee.name}`;
          } else {
            bill.description = `Bill for ${subscription.serviceFee.name} (${subscription.startDate} - ${subscription.endDate}`;
          }
          bill.disCountInPercentage = 0;
          bill.vatInPercentage = 0;
          bill.currentAmountInMinorUnit = +subscription.serviceFee.amountInMinorUnit;
          bill.payableAmountInMinorUnit = +BillService.calculateAmountToBePaid(bill);
          bill.totalAmountPaidInMinorUnit = 0;
          bill.code = sq;
          bill.subscription = subscription;
          bill.membership = membership;
          return em.save(bill).then((bill) => {
            subscription.totalPayableAmount = Number(subscription.totalPayableAmount) + Number(bill.payableAmountInMinorUnit);
            return em.save(subscription).then(_ => bill);
          });
        });
    });

  }

  private static calculateAmountToBePaid(bill: Bill) {
    let amountAfterDiscount = (1 - (bill.disCountInPercentage / 100)) * bill.currentAmountInMinorUnit;
    return (1 + (bill.vatInPercentage / 100)) * amountAfterDiscount;
  }
}
