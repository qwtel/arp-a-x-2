const once = (stream, eventName) => new Promise(resolve => stream.on(eventName, resolve));

async function reduce(xs, reducer, init) {
  let res = init;
  for await (const chunk of xs) {
    res = reducer(res, chunk);
  }
  return res;
}

const slurp = (stream) => reduce(stream, (a, b) => a + b, '');

function groupBy(xs, f) {
  const res = new Map();
  for (const x of xs) {
    const key = f(x);
    const group = res.get(key) || [];
    res.set(key, [...group, x]);
  }
  return res;
}

module.exports = {
  once,
  reduce,
  slurp,
  groupBy,
};
