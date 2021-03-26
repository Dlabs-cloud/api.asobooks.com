export class MembershipRoleDto {
  firstName: string;
  lastName: string;
  email: string;
  identifier: string;
  roles: {
    name: string,
    code: string
  }[];
}
