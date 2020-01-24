const once = (stream, eventName) => new Promise(resolve => stream.on(eventName, resolve));

async function reduce(xs, reducer, init) {
  let res = init;
  for await (const chunk of xs) {
    res = reducer(res, chunk);
  }
  return res;
}

const slurp = (stream) => reduce(stream, (a, b) => a + b, '');

module.exports = {
  once,
  reduce,
  slurp,
};
