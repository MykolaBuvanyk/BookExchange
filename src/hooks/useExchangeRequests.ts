"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchUserExchangeRequests,
  updateExchangeRequestStatus,
} from "@/features/exchange-requests";
import type { ExchangeRequest } from "@/types";

export function useExchangeRequests(userId?: string) {
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadRequests() {
      if (!userId) {
        setRequests([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const loadedRequests = await fetchUserExchangeRequests(userId);

        if (isCurrentRequest) {
          setRequests(loadedRequests);
        }
      } catch {
        if (isCurrentRequest) {
          setError("Could not load exchange requests.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      isCurrentRequest = false;
    };
  }, [userId]);

  const updateRequestStatus = useCallback(
    async (requestId: string, status: "accepted" | "rejected") => {
      setUpdatingRequestId(requestId);
      setError(null);

      try {
        await updateExchangeRequestStatus(requestId, status);
        setRequests((currentRequests) =>
          currentRequests.map((request) =>
            request.id === requestId ? { ...request, status } : request,
          ),
        );
      } catch {
        setError("Could not update exchange request.");
      } finally {
        setUpdatingRequestId("");
      }
    },
    [],
  );

  return {
    error,
    isLoading,
    requests,
    setRequests,
    updateRequestStatus,
    updatingRequestId,
  };
}
