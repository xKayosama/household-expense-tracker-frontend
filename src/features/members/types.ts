export interface HouseholdMemberUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

export interface HouseholdMember {
  _id: string;
  householdId: string;
  userId: HouseholdMemberUser;
  role: 'OWNER' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMembersResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    members: HouseholdMember[];
  };
}