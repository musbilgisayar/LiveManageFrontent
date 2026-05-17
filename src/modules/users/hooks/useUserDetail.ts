import { useSuperAdminUserDetail } from "./useSuperAdminUserDetail";
import { useSelfUserDetail } from "./useSelfUserDetail";

import type { UserDetailMode } from "../config/userDetailTabs.config";

type UseUserDetailParams = {
  mode: UserDetailMode;
  userId?: string;
};

export function useUserDetail({ mode, userId }: UseUserDetailParams) {
  const isSelfMode = mode === "self";

  const adminResult = useSuperAdminUserDetail(!isSelfMode ? userId : undefined);
  const selfResult = useSelfUserDetail({ enabled: isSelfMode });

  return isSelfMode ? selfResult : adminResult;
}