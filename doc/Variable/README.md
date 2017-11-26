Variable is very useful for these cases:

1. Request in multiple environment.

2. Request has many dynamic parameters in url query or body.

3. A request depend on one or more requests.

4. Need change request's url/headers/body before sending it.

Variable is always a key-value object and use with a uniform format: `{{key}}`, you can use variable in `Common Pre Request Script`, `Pre Request Script`, `Test`, `Url`, `Body` and `Header`.

All `{{key}}` will be replace to `Value` of the variable before or after sending reqeust. Variable transfer workflow reference to: [Variable Transfer Workflow](../Script/README.md).

Hitchhiker have three types of variable.

1. [Environment variable](Env_Var.md)

2. [Parameter variable](Param_Var.md)

3. [Runtime variable](Dynamic_Var.md)