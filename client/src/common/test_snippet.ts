export const testSnippets = {
    'Response body is equal to a string': 'tests["body is correct"] = responseBody === "body...";',
    'Response body contains a string': 'tests["body contains string"] = responseBody.indexOf("some string...") > -1;',
    'Response body json object': 'tests["value is correct"] = responseObj.value === 100;',
    'Response header check': 'tests["contains json header"] = responseHeaders["content-type"] === "application/json; charset=utf-8";',
    'Response time is less than 200ms': 'tests["response time is less than 200ms"] = responseTime < 200;',
    'Response status check': 'tests["status code is 200"] = responseCode.code === 200;',
    'Response status name': 'tests["status code name is ok"] = responseCode.name === "OK";',
};