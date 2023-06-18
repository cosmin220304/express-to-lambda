import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import { Request, Response, Application } from "express";

type Adapter = (app: Application) => Handler;

type CustomResponse = Partial<Response> & {
  isStatusSet: boolean;
  statusVal: number;
  bodyVal: string | object;
  textVal: string;
  headers: any[];
};

type ResponseFactory = (
  callback: Function
) => CustomResponse;

export const adapter: Adapter =
  (app) =>
  async (
    event: APIGatewayProxyEvent & APIGatewayProxyEventV2
  ) => {
    const request: Partial<Request> = {
      path: event.requestContext?.http?.path ?? event.path,
      body: event.body ? JSON.parse(event.body) : null,
      method:
        event.requestContext?.http?.method ??
        event.httpMethod,
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

    // @ts-ignore
    const response: ResponseFactory = (
      callback: Function
    ) => ({
      status: function (code: number) {
        this.statusVal = code;
        this.isStatusSet = true;
        return this;
      },
      send: function (body: string | object) {
        if (!this.isStatusSet) {
          this.statusVal = 200;
          this.isStatusSet = true;
        }
        if (typeof body === "object") this.bodyVal = body;
        else this.textVal = body;
        callback && callback(this);
      },
      json: function (body: string | object) {
        this.send!(body);
      },
      end: function () {
        this.send!("");
      },
      setHeader: function (header: string, value: any) {
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
      .filter((s: any) => s.handle && !s.handle.stack)
      .map((s: any) => s.handle);

    const router = app._router.stack
      .flatMap((stack: any) => {
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
        ({ route, regexp }: any) =>
          route &&
          regexp.test(request.path) &&
          route.methods[request.method!.toLowerCase()] ===
            true
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
      .filter(
        (route: any) => route && !route.startsWith(":")
      );
    const idParams = request.path // [<value of :id>, <value of :id2>]
      .split("/")
      .filter(
        (path) => path && !nonIdParams.includes(path)
      );
    request.params = {};
    for (let i = 0; i < router.keys.length; i++) {
      const { name } = router.keys[i];
      request.params[name] = idParams[i];
    }

    let errorMiddleware: Function;
    for (const middleware of middlewares) {
      if (
        middleware
          .toString()
          .split("{")[0]
          .includes("(err, req, res, next)")
      ) {
        errorMiddleware = middleware;
        continue;
      }
      await new Promise((resolve) =>
        middleware(request, response(resolve), resolve)
      );
    }

    const res = (await new Promise((resolve) =>
      router.handle(
        request,
        response(resolve),
        (err: any) =>
          errorMiddleware &&
          errorMiddleware(
            err,
            request,
            response(resolve),
            resolve
          )
      )
    )) as CustomResponse;

    return {
      statusCode: res.statusVal,
      body: res.bodyVal
        ? JSON.stringify(res.bodyVal)
        : res.textVal,
    };
  };
