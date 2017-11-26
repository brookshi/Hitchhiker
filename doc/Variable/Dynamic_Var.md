Runtime variable is defined in Script, usually it's used to generate hash value dynamically for url or save a request's response and use it in another request.

Runtime variable can be defined in `Global Function`, `Common Pre Request Script`, `Pre Request Script` and `Test`.

Use this API as below:

```js
hitchhiker.setEnvVariable('rt_var', 'test');  // define a variable with key: `rt_var`, value: `test`
const value = hitchhiker.getEnvVariable('rt_var'); // get variable's value (`test`)
```

A typical scenario:

We have 4 APIs: `create`, `select`, `update`, `delete`.
`create` API create a item and return id.
we need this id to test the 3 other APIs, so we can set id to a Runtime variable in Test script of `create` and use it in `select`, `update`, `delete`.
