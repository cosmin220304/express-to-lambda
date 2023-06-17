export const HANDLER = `exports.handler = async (event) => {
  const request = {
    path: event.requestContext?.http?.path ?? event.path,
    body: event.body ? JSON.parse(event.body) : null,
    method:
      event.requestContext?.http?.method ??
      event.httpMethod,
    params: event.pathParameters,
    query: event.queryStringParameters,
    headers: event.headers,
  };
  request.url = request.path;
  if (request.query) request.url += "?" + request.query;

  if (!request.path || !request.method) {
    return {
      statusCode: 404,
      body: "Lambda didn't receive any event which contains a valid path or http method!",
    };
  }

  const response = (callback) => ({
    status: function (code) {
      this.statusVal = code;
      return this;
    },
    send: function (body) {
      if (!this.isStatusSet) {
        this.statusVal = 200;
        this.isStatusSet = true;
      }
      if (typeof body === "object") this.bodyVal = body;
      else this.textVal = body;
      callback && callback(this);
    },
    json: function (body) {
      this.send(body);
    },
    end: function () {
      this.send("");
    },
    setHeader: function (header, value) {
      this.headers.push([header, value]);
      return this;
    },
    isStatusSet: false,
    statusVal: 0,
    bodyVal: "",
    textVal: "",
    headers: [],
  });

  const middlewares = app._router.stack
    .filter((s) => s.handle && !s.handle.stack)
    .map((s) => s.handle);

  const router = app._router.stack
    .flatMap((stack) => {
      const ret = [];
      if (stack.route) {
        ret.push(stack);
      }
      if (stack.handle?.stack) {
        ret.push(...stack.handle.stack);
      }
      return ret;
    })
    .find(
      ({ route, regexp }) =>
        route &&
        regexp.test(request.path) &&
        route.methods[request.method.toLowerCase()] === true
    );

  if (!router) {
    return {
      statusCode: 404,
      body: "Path not found!",
    };
  }

  const routeRegex = router.route.path; // /path/:id/subpath/:id2
  const nonIdParams = routeRegex // [path, subpath]
    .split("/")
    .filter((route) => route && !route.startsWith(":"));
  const idParams = request.path  // [<value of :id>, <value of :id2>]
    .split("/")
    .filter((path) => path && !nonIdParams.includes(path));
  request.params = {};
  for (let i = 0; i < router.keys.length; i++) {
    const { name } = router.keys[i];
    request.params[name] = idParams[i];
  }

  for (const middleware of middlewares) {
    await new Promise((resolve) =>
      middleware(request, response(resolve), resolve)
    );
  }

  const res = await new Promise((resolve) =>
    router.handle(request, response(resolve), resolve)
  );

  return {
    statusCode: res.statusVal,
    body: res.bodyVal
      ? JSON.stringify(res.bodyVal)
      : res.textVal,
  };
};
`;
