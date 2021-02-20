import { useEffect } from "react";
export { useAsyncEffect };

function useAsyncEffect(asyncEffect: AsyncFn | (() => AsyncObj)): void {
  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    const maybeAsyncObj = asyncEffect(isMounted);

    const { asyncFn, cleanupFn } = isAsyncObj(maybeAsyncObj) ? maybeAsyncObj : emptyAsyncObj;

    asyncFn?.(isMounted);

    return () => {
      mounted = false;
      cleanupFn?.();
    };
  }, [asyncEffect]);
}

type AsyncFn = (isMounted: () => boolean) => Promise<void>;
type AsyncObj = {
  readonly asyncFn: AsyncFn;
  readonly cleanupFn?: () => void;
};

function isAsyncObj(asyncEffect: AsyncObj | Promise<void>): asyncEffect is AsyncObj {
  return (asyncEffect as AsyncObj).asyncFn !== undefined;
}

const emptyAsyncObj = { asyncFn: undefined, cleanupFn: undefined };
