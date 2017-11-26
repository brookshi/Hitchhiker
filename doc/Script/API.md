Script will run in a sandbox with some build-in API, this APIs will help you to implement powerful function.

#### require
Require function allows you to import some build-in js lib listed below:

1. **uuid**:   [generate guid](https://github.com/kelektiv/node-uuid)
2. **xlsx** :  [read excel file](https://github.com/SheetJS/js-xlsx)
3. **request**:   [request data in script](https://github.com/request/request)
4. **lodash**:  [popular javaScript utility lib](https://lodash.com/)
5. **crypto-js**:  [crypto lib](https://github.com/brix/crypto-js)

Of course, these build-in libs cann't meet all user's demand. Hitchhiker also support custom js lib, yo u can upload js lib which you want in Project with zip format (ref to [Custom js lib](Custom JS Lib.md)), then you can require this js lib in script, that's to say, you can do whatever you want in script, such as read data from DB.

```js
const request = hitchhiker.require('request');

function getData() {
    return new Promise((resolve, reject) => {
            const req = request("http://httpbin.org/get?a=request in request", (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            });
        });
}

const res = await getData(); // MUST use async/await
```

#### saveFile
Parameters: 
> file: string
> content: string
> replaceIfExist: boolean default is true

Save data as a file, and use it in another request's script.

```js
hitchhiker.saveFile('test.txt', 'test file content'); 
```

#### readFile
Parameters: 
> file: string
Return string value of file content.

Read a file that you upload to Project Data or saved in some other requests.

```js
const value = hitchhiker.readFile('test.txt');
```

#### readFileByReader
Parameters:
> file: string
> reader: function(file)
Return string value of file content.

Read a file with custom reader like excel reader.

```js
const xlsx = hitchhiker.require('xlsx');

const workbook = hitchhiker.readFileByReader('test.xlsx', xlsx.readFile); 
```

#### removeFile          
Parameters:
> file: string

Remove a file from server.

 ```js
 hitchhiker.removeFile('test.txt');
 ``` 
 
 #### setEnvVariable
 Parameters:
 > key: string
 > value: any
 
 Set a runtime variable.
 
 ```js
 hitchhiker.setEnvVariable('value', 'test');
 ```
 
 #### getEnvVariable
 Parameters:
 > key: string
 
 Get a runtime variable's value.
 
 ```js
 const value = hitchhiker.getEnvVariable('value');
 ```
 
 #### removeEnvVariable
 Parameters:
 > key: string
 
 Remove a runtime variable.
 
 ```js
 hitchhiker.removeEnvVariable('value');
 ```
 #### environment
 
 Get selected environment.
 
 ```js
 const env = hitchhiker.environment;
 ```
 
 #### request
 
 Get current request include url, method, headers, body.
 
 ```js
 const req = hitchhiker.request;
 
 const {url, headers, method, body} = req;
 ```
 
 ### setRequest
 
 Change current request, you can get request and then modify url/method/headers/body and then set it.
 
 ```js
 const crypto = hitchhiker.require('crypto-js');

 const sign = crypto.HmacSHA1('test', 'asdf');

 const req = hitchhiker.request;
 
 url = `${url}?sign=${sign}`;
 
 hitchhiker.setRequest({...hitchhiker.request, url});
 ```
 
 #### export
 
 Export data for comparison with different environment in Schedule. 
 
 ```js
 Reflect.deleteProperty(responseObj, 'date');
 
 hitchhiker.export(responseObj);
 ```
