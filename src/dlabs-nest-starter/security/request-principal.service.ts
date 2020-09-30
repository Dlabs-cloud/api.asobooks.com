import { Injectable, Scope } from '@nestjs/common';
import { PortalUser } from '../../domain/entity/portal-user.entity';
import { Association } from '../../domain/entity/association.entity';


export class RequestPrincipal {
  portalUser: PortalUser;
  association: Association;
}