import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { BillInvoice } from '../../domain/entity/bill-invoice.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Invoice } from '../../domain/entity/invoice.entity';
import { Bill } from '../../domain/entity/bill.entity';

export class BillInvoiceFactory implements FactoryHelper<BillInvoice> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<BillInvoice> {
    const billInvoice = new BillInvoice();
    billInvoice.invoice = await modelFactory.create(Invoice);
    billInvoice.bill = await modelFactory.create(Bill);
    return billInvoice;
  }

}