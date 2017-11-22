In general, there are several environments for API coding or testing, eg：QA, Stage, UAT, Prod..., these environments use different domain or headers etc... 

It's easy to handle this by using `Environment`: set variables in `Environment` and use variables in `Request`, then send request by selecting different `Environment` to get the corresponding response.

Back to Project module to create two environment.
1. Click `New Environment` button.
2. Enter name `QA`
3. Enter variable key: env, value: qa.
4. Click OK button.

We get a environment row in the table, click `Duplicate` button to get a copy and then click `edit` button to edit it.
1. Change name to `UAT`
2. Change variable value: uat.
3. Click OK button.

Now we have two different environment already, go to Collection module to use it.

Select the request `Sample Request` we create before, the current url is : `http://httpbin.org/get?env=qa`, let's change the `qa` to a variable `{{env}}`, the whole url now like: `http://httpbin.org/get?env={{env}}`. That's the syntax of using variable, wrap variable's key with `{{}}`, and Hitchhiker will replace to variable's value when send request.

OK. We can test it now. Select QA environment on the right top drop down and hit Send button, we will get response like this:

Change environment to STG and hit Send button, the response will be:

It's clear, `{{env}}` has been replaced to the value of variable that we defined in Environment.