import { Connection } from 'typeorm/connection/Connection';
import { Bill } from '../domain/entity/bill.entity';
import { SettingRepository } from '../dao/setting.repository';
import { Invoice } from '../domain/entity/invoice.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { InvoiceCodeSequence } from '../core/sequenceGenerators/invoice-code.sequence';
import { BillInvoice } from '../domain/entity/bill-invoice.entity';
import { Membership } from '../domain/entity/membership.entity';
import { Injectable } from '@nestjs/common';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { EntityManager } from 'typeorm';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { InvoiceRepository } from '../dao/invoice.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { BillService } from './bill.service';
import { Association } from '../domain/entity/association.entity';

@Injectable()
export class InvoiceService {
  constructor(private readonly connection: Connection,
              private readonly billService: BillService,
              private readonly invoiceCodeSequence: InvoiceCodeSequence) {
  }


  updateInvoice(entityManager: EntityManager, paymentRequest: PaymentRequest) {
    return this.connection
      .getCustomRepository(InvoiceRepository)
      .findById(GenericStatusConstant.ACTIVE, paymentRequest.invoiceId).then(invoices => {
        const invoice = invoices[0];
        invoice.paymentStatus = paymentRequest.paymentStatus;
        return entityManager.save(invoice);
      }).then(invoice => {
        return this.billService.updateBill(entityManager, invoice).then(() => Promise.resolve(invoice));
      });
  }

  createInvoice(bills: Bill[], createdBy: Membership, association: Association): Promise<Invoice> {
    let payableAmount = bills
      .filter(bill => bill.paymentStatus !== PaymentStatus.PAID)
      .map(bill => bill.payableAmountInMinorUnit)
      .reduce(((previousValue, currentValue) => previousValue + currentValue), 0);
    let invoice = new Invoice();
    return this.invoiceCodeSequence.next()
      .then(code => {
        invoice.code = code;
        return Promise.resolve(invoice);
      }).then(invoice => {
        return this.connection.getCustomRepository(SettingRepository)
          .findByLabel('SURCHARGE', String(200_00))
          .then(surcharge => {
            let extraCharge = Number(surcharge.value);
            invoice.amountInMinorUnit = payableAmount;
            invoice.createdBy = createdBy;
            invoice.association = association;
            invoice.surchargeInMinorUnit = extraCharge;
            invoice.amountPaidInMinorUnit = 0;
            invoice.payableAmountInMinorUnit = payableAmount + extraCharge;
            invoice.paymentStatus = PaymentStatus.NOT_PAID;
            return Promise.resolve(invoice);
          });
      }).then(invoice => {
        return this.connection.transaction(async entityManager => {
          await entityManager.save(invoice);
          const billInvoices: Promise<BillInvoice>[] = bills.map(bill => {
            let billInvoice = new BillInvoice();
            billInvoice.invoice = invoice;
            billInvoice.bill = bill;
            return entityManager.save(billInvoice);
          });
          await Promise.all(billInvoices);
          return Promise.resolve(invoice);
        });
      });

  }
}