const slowDown =
  (ms: number) =>
  ({ next }) =>
    setTimeout(() => next(), ms);

export default slowDown;
