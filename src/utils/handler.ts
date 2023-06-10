export const HANDLER = `async (event) => {
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

  if (!request.path || !request.method) {
    return {
      statusCode: 404,
      body: "Lambda didn't receive any event which contains a valid path or http method!",
    };
  }

  const response = {
    status: function (code) {
      this.statusVal = code;
      return this;
    },
    send: function (body) {
      if (!this.isStatusSet) {
        this.statusVal = 200;
        this.isStatusSet = true;
      }
      this.textVal = body;
      return this;
    },
    json: function (body) {
      if (!this.isStatusSet) {
        this.statusVal = 200;
        this.isStatusSet = true;
      }
      this.bodyVal = body;
      return this;
    },
    isStatusSet: false,
    statusVal: 0,
    bodyVal: "",
    textVal: "",
  };

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
      ({ route }) =>
        route &&
        route.path === request.path &&
        route.methods[request.method.toLowerCase()] === true
    );

  if (!router) {
    return {
      statusCode: 404,
      body: "Path not found!",
    };
  }

  await router.handle(request, response, () => {});

  return {
    statusCode: response.statusVal,
    body: response.bodyVal
      ? JSON.stringify(response.bodyVal)
      : response.textVal,
  };
};
`;
