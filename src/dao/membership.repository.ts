import { EntityRepository } from 'typeorm';
import { Membership } from '../domain/entity/membership.entity';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { AccountType } from 'aws-sdk/clients/chime';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { Invoice } from '../domain/entity/invoice.entity';


@EntityRepository(Membership)
export class MembershipRepository extends BaseRepository<Membership> {

  public findByPortalAccountAndPortalUser(portalUser: PortalUser,
                                          portalAccount: PortalAccount,
                                          status = GenericStatusConstant.ACTIVE): Promise<Membership> {
    return this.createQueryBuilder('membership')
      .select()
      .where('membership.portalUser=:portalUserId')
      .andWhere('membership.portalAccount=:portalAccountId')
      .andWhere('membership.status=:status')
      .setParameter('status', status)
      .setParameter('portalUserId', portalUser.id)
      .setParameter('portalAccountId', portalAccount.id)
      .getOne();
  }


  findByUserAndAssociation(user: PortalUser, association: Association, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('membership')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'portalAccount.id = membership.portalAccountId')
      .innerJoin(Association, 'association', 'association.id = portalAccount.associationId')
      .where('membership.portalUser = :portalUser', { portalUser: user.id })
      .andWhere('membership.status = :status', { status: status })
      .andWhere('association.id = :association', { association: association.id })
      .getOne();

  }

  public findByAssociationAndAccountTypeAndStatusAndUserIds(association: Association,
                                                            accountType: PortalAccountTypeConstant,
                                                            status = GenericStatusConstant.ACTIVE,
                                                            ...users: number[]) {

    return this.createQueryBuilder('membership')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('portalAccount.association = :association')
      .andWhere('portalAccount.type = :type')
      .andWhere('membership.status = :status')
      .andWhere('membership.portalUser IN (:...users) ')
      .setParameter('association', association.id)
      .setParameter('type', accountType)
      .setParameter('status', status)
      .setParameter('users', users)
      .getMany();
  }

  public countByAssociationAndAccountTypeAndStatus(association: Association, accountType: AccountType, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('membership')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('portalAccount.association = :association')
      .andWhere('portalAccount.type = :type')
      .andWhere('membership.status = :status')
      .setParameter('association', association.id)
      .setParameter('type', accountType)
      .setParameter('status', status)
      .getCount();
  }


  public findByPaymentTransactions(paymentTransactions: PaymentTransaction[]) {
    const paymentTransactionIds = paymentTransactions.map(paymentTransaction => paymentTransaction.id);
    return this.createQueryBuilder('membership')
      .select()
      .innerJoin(Invoice, 'invoice', 'invoice.createdById = membership.id')
      .innerJoin(PaymentRequest, 'paymentRequest', 'paymentRequest.invoiceId = invoice.id')
      .innerJoin(PaymentTransaction, 'paymentTransaction', 'paymentTransaction.paymentRequestId = paymentRequest.id')
      .where('paymentTransaction IN (:...paymentTransactions)')
      .setParameter('paymentTransactions', paymentTransactionIds)
      .getMany();
  }


}