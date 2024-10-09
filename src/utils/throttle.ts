const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastFunc: NodeJS.Timeout | undefined;
  let lastRan: number | undefined;

  return (...args: Parameters<T>): void => {
    const context = this;

    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - (lastRan as number) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - (lastRan as number)));
    }
  };
};

export default throttle;
