import type { Observable } from "rxjs";
import { firstValueFrom } from "rxjs";
import { shallowRef, getCurrentScope, onScopeDispose } from "vue";
import type { MultiWatchSources, ShallowRef, WatchOptions } from "vue";

import { liveQuery, type Subscription } from "dexie";

import { extendRef } from "@vueuse/core";

type Value<T, I> = I extends undefined ? T | undefined : T | I;

type UseDexieLiveQueryWithDepsOptions<I, Immediate> = {
  onError?: (error: unknown) => void;
  initialValue?: I;
  // watch?: MultiWatchSources
} & WatchOptions<Immediate>;

type _UseDexieLiveQueryOptions<I> = {
  onError?: (error: unknown) => void;
  initialValue?: I;
};

function tryOnScopeDispose(fn: () => void) {
  if (getCurrentScope()) onScopeDispose(fn);
}

export function useDexieLiveQueryWithDeps<
  T,
  I = undefined,
  Immediate extends Readonly<boolean> = true,
>(
  querier: (...data: unknown[]) => T | Promise<T>,
  options: UseDexieLiveQueryWithDepsOptions<I, Immediate> = {},
) /* : ShallowRef<Value<T, I>> */ {
  const { onError, initialValue } = options;

  const value = shallowRef<T | I | undefined>(initialValue);
  const ready = shallowRef(false);

  const valueRef = extendRef(value as ShallowRef<Value<T, I>>, {
    ready,
  });

  let subscription: Subscription | undefined = undefined;

  function _start(...data: unknown[]) {
    subscription?.unsubscribe();

    const observable = liveQuery(() =>
      querier(...data),
    ) as unknown as Observable<T>;

    firstValueFrom(observable).then(() => {
      valueRef.ready = true;
    });

    subscription = observable.subscribe({
      next: (result) => {
        value.value = result;
      },
      error: (error) => {
        onError?.(error);
      },
    });
  }

  function cleanup() {
    subscription?.unsubscribe();

    // Set to undefined to avoid calling unsubscribe multiple times on a same subscription
    subscription = undefined;
  }

  // watch(options.watch ?? [], start, { immediate: true, ...rest });

  tryOnScopeDispose(() => {
    cleanup();
  });

  return valueRef;
}

export function useDexieLiveQuery<
  T,
  Suspense extends boolean,
  _I = undefined /* implicit */,
>(
  querier: () => T | Promise<T>,
  options?: {
    initialData?: T;
    watch?: MultiWatchSources;

    /**
     * use "await suspense()" to wait for the first result
     */
    suspense?: Suspense;
  },
) {
  if (process.env.NODE_ENV === "development") {
    if (!getCurrentScope()) {
      console.warn(
        '"useDexieAsyncData()" should only be used inside a "setup()" function or a running effect scope. They might otherwise lead to memory leaks.',
      );
    }
  }

  // const { /* onError,  */
  //   initialData
  // } = options ?? {};

  //when suspense is used the data is never undefined
  const data = shallowRef() as unknown as Suspense extends true
    ? ShallowRef<T>
    : ShallowRef<T | undefined>;

  let subscription: Subscription | null = null;
  let observable: Observable<T> | null = null;
  const isReady = shallowRef(false);

  //basically just suspending until the first value from the observer arrives
  function suspense() {
    if (!observable) return;

    return firstValueFrom(observable).then((res) => {
      data.value = res;
      return res;
    });
  }

  async function handler() {
    //not a live query
    subscription?.unsubscribe();

    observable = liveQuery(() => {
      return querier();
    }) as unknown as Observable<T>; //dexie's Observable is a different interface but does the same

    firstValueFrom(observable).then(() => {
      isReady.value = true;
    });

    subscription = observable.subscribe({
      next: (result) => {
        data.value = result;
      },
      error: () => {
        // onError?.(error);
      },
    });
  }

  if (options?.watch) {
    // watch(options.watch, handler, {
    //   ...rest,
    //   immediate: true,
    //   deep: true
    //   /* , flush: "pre" */
    // })
  }

  handler();

  function refresh() {
    handler();
  }

  tryOnScopeDispose(() => {
    subscription?.unsubscribe();

    // Set to null to avoid calling unsubscribe multiple times on a same subscription
    subscription = null;
    observable = null;
  });

  return {
    data,
    isReady,
    suspense,
    refresh,
  };
}

/* const { data } = useDBLiveQuery(async db => {
  const data = await db.pdf.toArray()

  return usePDF(data)
})
 */

// function liveQueryRx<T>(querier: () => T | Promise<T>): Observable<T> {
//   return from(liveQueryDexie(querier))
// }

// export function useDexieLiveQuery<T>(querier: () => T | Promise<T>, opts?: {
//   watch?: WatchSource<unknown>[]
// }) {

//   const obs = liveQueryRx(querier)

//   if (opts?.watch) {
//     const obsQuery = from(opts.watch, {
//       immediate: true,
//       deep: false,
//     })

//     const source = obsQuery.pipe(map(() => obs))

//     watch(opts.watch, v => {
//       source.pipe(switchAll())
//     })
//   }

//   /* const dbQ = liveQuery(() => db.documents.where("textIndex").startsWithIgnoreCase(query.value).distinct().toArray());
//   const source = obsQuery.pipe(map(() => dbQ));
//   const out = source.pipe(switchAll());

//   return { view: out, query: query }; */

//   return useObservable(obs)
// }
