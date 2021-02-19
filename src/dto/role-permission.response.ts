export class RolePermissionResponse {
  name: string;
  code: string;
  permissions: { name, code }[];
}