脚本是运行在一个沙盒环境里，内置了一些函数和常用库方便使用，借此可以实现强大的功能。

#### require
使用Require函数可以直接引入Hitchhiker内置的js库：

1. **uuid**:   [生成guid](https://github.com/kelektiv/node-uuid)
2. **xlsx** :  [读取excel文件](https://github.com/SheetJS/js-xlsx)
3. **request**:   [在脚本里发送请求](https://github.com/request/request)
4. **lodash**:  [js常用工具库](https://lodash.com/)
5. **crypto-js**:  [加解密相关](https://github.com/brix/crypto-js)

当然，这些内置的库不能满足所有人的需求，Hitchhiker支持自定义脚本库，你可以上传任何zip格式的js库到Project里 (参考 [自定义脚本库](custom-javascript-lib-cn.md), 然后就可以在脚本里通过`require`来引用并使用这个库，也就是说，任何nodejs下的库都可以在这里使用，即便是操作数据库。

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

保存数据到文件，然后可以在这个Project下的其他Request访问到

```js
hitchhiker.saveFile('test.txt', 'test file content');
```

#### readFile
Parameters:
> file: string
Return string value of file content.

读取这个Project下的文件，这个文件可以是上传的也可以是上面`saveFile`保存下来的

```js
const value = hitchhiker.readFile('test.txt');
```

#### readFileByReader
Parameters:
> file: string
> reader: function(file)
Return string value of file content.

使用自定义的方式读取文件，比如读取excel文件

```js
const xlsx = hitchhiker.require('xlsx');

const workbook = hitchhiker.readFileByReader('test.xlsx', xlsx.readFile);
```

#### removeFile
Parameters:
> file: string

删除文件

```js
hitchhiker.removeFile('test.txt');
```

#### setEnvVariable
Parameters:
> key: string
> value: any

设置一个运行时环境变量

```js
hitchhiker.setEnvVariable('value', 'test');
```

#### getEnvVariable
Parameters:
> key: string

获取一个运行时环境变量的值

```js
const value = hitchhiker.getEnvVariable('value');
```

#### removeEnvVariable
Parameters:
> key: string

删除一个运行时变量

```js
hitchhiker.removeEnvVariable('value');
```

#### environment
获取当前环境

```js
const env = hitchhiker.environment;
```

#### request
获取当前Request，包括 url, method, headers, body.

```js
const req = hitchhiker.request;

const {url, headers, method, body} = req;
```

### setRequest
修改当前的Request，可以先获取request进行修改后再set

```js
const crypto = hitchhiker.require('crypto-js');

const sign = crypto.HmacSHA1('test', 'asdf');

const req = hitchhiker.request;
url = `${url}?sign=${sign}`;
hitchhiker.setRequest({...hitchhiker.request, url});
```

#### export
导出在Schedule做数据对比时的数据

```js
Reflect.deleteProperty(responseObj, 'date');
hitchhiker.export(responseObj);
```
