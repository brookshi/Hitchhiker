Environment variable could be defined in Project's environment, usually, Environment variable is used to set url's host, query string and headers.

For example:
We have three environment for our API: QA, Stage, Product. Each of environment have different domain name:
```
QA: http://api-qa.sample.com/
Stage: http://api-stg.sample.com/
Product: http://api.sample.com/
```

Without variable, we need create three request for these domains, it's too tedious.

We could create a environment named QA and add a variable with key: `host`, value: `http://api-qa.sample.com/`.
Duplicate it and do the same thing for Stage and Product.

Now we get three environments, we can use it in one request.
Create a request with url: `{{host}}/get`, select environment and hit Send button.

`{{host}}` will be replaced by the variable's value of selected environment. So if select QA, request's url will be `http://api-qa.sample.com/
`, and Stage will be `http://api-stg.sample.com/
`.