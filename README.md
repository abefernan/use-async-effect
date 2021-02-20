# useAsyncEffect

## Description

React Hook for async calls that wraps `useEffect` to avoid running into the following React warning:

`Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
To fix, cancel all subscriptions and asynchronous tasks in a
useEffect cleanup function.`

This issue might happen with the following code:

```typescript
const [data, setData] = useState();

useEffect(() => {
  async function updateData() {
    const data = await getData();
    setData(data); // This line throws the warning
  };

  updateData();
}, [getData]);
```

By the time `await getData()` has finished its execution, if the component is no longer in the DOM, `setData(data)` fails because it cannot longer update `data`.

The way to avoid this is adding an `isMounted` check and a `useEffect` cleanup function:

```typescript
const [data, setData] = useState();

useEffect(() => {
  let isMounted = true;

  async function updateData() {
    const data = await getData();
    if(isMounted) setData(data);
  };

  updateData();

  return () => {
    isMounted = false;
  }
}, [getData]);
```

## Usage

`useAsyncEffect` wraps the `useEffect` and includes the `isMounted` check, so that the developer only writes the async call code, and optionally some sync code and a cleanup function.

The passed callback needs to be wrapped into a `useCallback` hook in order to properly manage the dependency array.

It supports calls for three use cases described below:

### Async call without cleanup function

```typescript
const [data, setData] = useState();

useAsyncEffect(useCallback(
  async function updateData(isMounted) {
    const data = await getData();
    if (isMounted()) setData(data);
  },
  [getData],
));
```

### Async call with cleanup function

```typescript
const [data, setData] = useState();

useAsyncEffect(useCallback(() => ({
  asyncFn: async (isMounted) => {
    const data = await getData();
    if (isMounted()) setData(data);
  },
  cleanupFn: () => {
    doSomeCleanup1();
    doSomeCleanup2();
  }
  }),
  [myValue]
));
```

### Async call with cleanup function and sync code

```typescript
const [data, setData] = useState();

useAsyncEffect(useCallback(() => {
  const setup = syncSetup();
  
  return {
    asyncFn: async (isMounted) => {
      const data = await getData(setup);
      if (isMounted()) setData(data);
    },
    cleanupFn: () => {
      doSomeCleanup1(setup);
      doSomeCleanup2(setup);
    }
  },
  [myValue]
});
```
