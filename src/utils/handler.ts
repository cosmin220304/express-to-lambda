export const HANDLER = `async (event) => {
  const request = {
    path: event.path,
    body: event.body ? JSON.parse(event.body) : null,
    method: event.httpMethod,
    params: event.pathParameters,
    query: event.queryStringParameters,
    headers: event.headers,
  };

  const response = {
    status: function (code) {
      this.statusVal = code;
      return this;
    },
    send: function (body) {
      if (this.statusVal === 0) this.statusVal = 200;
      this.textVal = body;
      return this;
    },
    json: function (body) {
      if (this.statusVal === 0) this.statusVal = 200;
      this.bodyVal = body;
      return this;
    },
    statusVal: 0,
    bodyVal: "",
    textVal: "",
  };

  const router = app._router.stack.find(
    ({ route }) => route && route.path === request.path
  );
  await router.handle(request, response, () => {});

  return {
    statusCode: response.statusVal,
    body: response.bodyVal
      ? JSON.stringify(response.bodyVal)
      : response.textVal,
  };
};
`;
