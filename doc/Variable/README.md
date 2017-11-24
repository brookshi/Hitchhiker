Variable is very useful for these cases:
1. Request in multiple environment.
2. Request has many dynamic parameters in url query or body.
3. A request depend on another request.
4. Need change request's url/headers/body before sending it.

Variable is always a key-value and have a uniform format: `{{key}}`, you can use variable in `Common Pre Request Script`, `Pre Request Script`, `Test`, `Url`, `Body`, `Header`.

All `{{key}}` will be replace to `Value` of the variable before or after sending reqeust. Variable transfer workflow reference to: [Variable Transfer Workflow]().

Hitchhiker have three types of variable.

1. [Environment variable]()
2. [Parameter variable]()
3. [Runtime variable]()