import { useCallback, useState } from "react";

export type UseRequestOptions<T> = {
  request?: () => Promise<T>;
};

export type UseRequestReturnValue<T> = {
  loading: boolean;
  requestError: boolean;
  data: T | null;
  makeRequest?: () => Promise<T>;
};

export default function useRequst<T>({
  request,
}: UseRequestOptions<T>): UseRequestReturnValue<T> {
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const makeRequest = useCallback(async () => {
    if (!request) throw new Error("Request option not set");
    try {
      setRequestError(false);
      setLoading(false);
      const response = await request();
      setData(response);
      return response;
    } catch (e) {
      setRequestError(true);
      throw e;
    } finally {
      setLoading(loading);
    }
  }, [request, setLoading, setRequestError]);

  return {
    data,
    loading,
    requestError,
    makeRequest: request ? makeRequest : undefined,
  };
}
