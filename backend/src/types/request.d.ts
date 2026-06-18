import { UserRole } from '../constants/enums';

export interface CurrentUser {
  id: number;
  email: string;
  role: UserRole;
}

