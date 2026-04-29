"use client";

import { useCallback, useState } from "react";
import {
  extendLockout,
  markManualReview,
  unlockIp,
  unlockUser,
} from "../services/lockoutOperation.service";

import type {
  ExtendLockoutRequestDto,
  LockoutOperationResultDto,
  MarkManualReviewRequestDto,
  UnlockIpRequestDto,
  UnlockUserRequestDto,
} from "../types/LockoutMonitoring.types";

type OperationState = {
  isProcessing: boolean;
  error: string | null;
  lastResult: LockoutOperationResultDto | null;
};

export function useLockoutOperations() {
  const [state, setState] = useState<OperationState>({
    isProcessing: false,
    error: null,
    lastResult: null,
  });

  const runOperation = useCallback(
    async (
      operation: () => Promise<LockoutOperationResultDto>
    ): Promise<LockoutOperationResultDto | null> => {
      setState({
        isProcessing: true,
        error: null,
        lastResult: null,
      });

      try {
        const result = await operation();

        setState({
          isProcessing: false,
          error: result.success ? null : result.message,
          lastResult: result,
        });

        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "monitoring.lockouts.operation.error";

        setState({
          isProcessing: false,
          error: message,
          lastResult: null,
        });

        return null;
      }
    },
    []
  );

  const unlockUserAsync = useCallback(
    (userId: string, request: UnlockUserRequestDto) => {
      return runOperation(() => unlockUser(userId, request));
    },
    [runOperation]
  );

  const unlockIpAsync = useCallback(
    (request: UnlockIpRequestDto) => {
      return runOperation(() => unlockIp(request));
    },
    [runOperation]
  );

  const extendLockoutAsync = useCallback(
    (lockoutId: string, request: ExtendLockoutRequestDto) => {
      return runOperation(() => extendLockout(lockoutId, request));
    },
    [runOperation]
  );

  const markManualReviewAsync = useCallback(
    (lockoutId: string, request: MarkManualReviewRequestDto) => {
      return runOperation(() => markManualReview(lockoutId, request));
    },
    [runOperation]
  );

  const resetOperationState = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      lastResult: null,
    });
  }, []);

  return {
    isProcessing: state.isProcessing,
    error: state.error,
    lastResult: state.lastResult,

    unlockUserAsync,
    unlockIpAsync,
    extendLockoutAsync,
    markManualReviewAsync,
    resetOperationState,
  };
}