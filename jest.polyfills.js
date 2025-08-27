// Global polyfills for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

if (typeof global.Request === 'undefined') {
  const { Request, Response, Headers, FetchError } = require('node-fetch');
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
  global.FetchError = FetchError;

  // Add missing Response.json static method for modern compatibility
  if (!Response.json) {
    Response.json = function (data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    };
  }
}
