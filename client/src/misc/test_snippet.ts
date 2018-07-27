import LocalesString from '../locales/string';

export function getTestSnippets() {
    const testSnippets = {
        [LocalesString.get('Snippet.BodyEqualString')]: 'tests["body is correct"] = responseBody === "body...";',
        [LocalesString.get('Snippet.BodyContainsString')]: 'tests["body contains string"] = responseBody.indexOf("some string...") > -1;',
        [LocalesString.get('Snippet.BodyJsonObj')]: 'tests["value is correct"] = responseObj.value === 100;',
        [LocalesString.get('Snippet.ResponseHeaderCheck')]: 'tests["contains json header"] = responseHeaders["content-type"] === "application/json; charset=utf-8";',
        [LocalesString.get('Snippet.ResponseTimeLess200')]: 'tests["response time is less than 200ms"] = responseTime < 200;',
        [LocalesString.get('Snippet.ResponseStatusCheck')]: 'tests["status code is 200"] = responseCode.code === 200;',
        [LocalesString.get('Snippet.ResponseStatusName')]: 'tests["status code name is ok"] = responseCode.name === "OK";',
    };

    return testSnippets;
};