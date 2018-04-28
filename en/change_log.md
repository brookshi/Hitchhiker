#### 0.11 2018-04-28

**Features:**

* \#158 Could use hhk instead of hitchhiker in script，(eg: hkr.setEnvVariable)
* \#110 Could use getEnvVariable to get Environment variable in Common Pre Request Script
* \#124 Display & edit & describe url's query string with key-value format
* \#12  Display & edit & describe form data of body wit key-value format
* \#122 Could beautify parameters
* \#127 Improve Scheduler page ui

**Bugs:**

* \#132 Error while using [new Request from cUrl]
* \#146 Chrome will hang if height of chrome's dev tool is high than hitchhiker's response panel
* \#138 Parameters lenght display error
* \#105 Scheduler style error when use filter in table


#### 0.10 2018-03-13

**Features:**

* \#104 Multiple languages supported(chinese).
* \#106 Auto add http:// to url if need
* \#116 Convert form data to body while import datat from postman

**Bugs:**

* \#91 exception caused by form data included special symbol
* \#103 improve email format verification

#### 0.9 2018-01-29

**Feature:**

* Assert base on UI


#### 0.8 2018-01-14

**Features:**

* Schedule statistics mode.
* \#67 stop stress test.
* \#64 run selected schedule.
* Schedule filter.
* Step by step install.

**Bugs:**

* change duplicated env will apply the change to origin env.


#### 0.7 2017-12-31

**Features:**

* \#63 support console.log debug in script.
* \#57 parameters could be a variable.
* \#34 support custom smtp mail interface.
* \#30 support swagger import.
* new request from cURL.
* generate code of java, python, go, c#... for request.
* beauty body(json/xml).
* beautify xml response.
* view diff of schedule comparision result.
* remove error annotate of variable in script/parameters.

**Bugs:**

* common pre script save error for new collection, strict ssl null.
* schedule save failed when check and uncheck compare.
* import postman json failed - headers may be null.
* request's duration miss waiting connect.
* not stop when find password failed.


#### 0.6 2017-12-18

**Features:**

* \#45 Stress test support ES6 and js lib, data.
* improve request workflow, refer to: [workflow](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/reuqest_wf.png).
* Test & Global function support Environment
* \#47 display image if response header include 'image/*'

**Bugs:**

* \#62 global function miss if switch module.
* \#59 exception caused by image data of schedule record.
* \#55 failed to construct WebSocket for stress test.
* schedule record timer take 1 min error.
* name will be reset if change method.


#### 0.5 2017-11-28

**Features:**

* \#41 New property `request` for Script included url, body, headers, method, new method `setRequest(request)` to change request before sent.
* \#41 Common Pre Request Script for Collection，this script will apply to all requests of this Collection.
* \#42 New config setting `inviteMemberDirectly` used to set if need email to invite members to Project, default is true (without email)。
* \#43 New document in gitboook： https://brookshi.gitbooks.io/hitchhiker/content/en/introduction.html
* \#44 New option `Request Follow Redirect` for Collection used to follow redirect if response status is 3xx, default is false.
* \#51 New option `Request Strict SSL` for Colllection used to check SSL cert, default is false.


#### 0.4.2 2017-11-18

**Bugs:**

* \#50 stress test exception, error setInterval


#### 0.4.1 2017-11-15

**Bugs:**

* \#40 post data more than 1M will cause exception: Payload Too Large


#### 0.4 2017-11-13

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/pre_request_script.PNG)

**Features:**

* add pre request script.
* \#29 project folder system, upload js lib or data to project and then use it in script.
* \#22 schedule support run in hour or minute.
* \#34 email custom notification interface.
* \#24 expose schedule run now interface for external applications.

**Bugs:**

* \#24 schedule sort request invalid.
* sync may override user data
* env edit dialog will be clear when sync data


#### 0.3 2017-10-30

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/sync.gif)

**Features:**

* support data sync automatically.

**Bugs:**

* url doesn't support chinese.


#### 0.2 2017-10-15

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stresstest.gif)

**Features:**

* support Stress Test.

* Support change port while using source code to deploy.

**Bugs:**

* Schedule run empty collection exception.


#### 0.1.3 2017-09-24

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/parameters.gif)

**Features:**

* request parameterization, include ManytoMany and OnetoOne, now you can use a request to handle multple situation like various query string, body.

* handle data by using $export$(data) for schedule comparing

* \#13 send request with common header like 'accept' etc.. which is defined in appconfig.json

**Bugs:**

* handle undefined value of test

* should not include cookie header if local cookie is empty

* origin request will miss headers after Save As request 


#### 0.1.2 2017-09-09

**Features:**

* could clear local cache

* request's headers auto complete

* favorite request's headers

* global function of tests

* adjust ui style


#### 0.1.1 2017-08-26

**Features:**

* Request history

* Localhost mapping

* Create request by click menu item of Collection/Folder

* Request match/unmatch in Schedule

* Add folder name for Schedule result

* Try without login

**Bugs:**

* Miss Headers sometimes after duplicating Request

* Schedule edit dialog should only display environments of selected Collection

* Run empty schedule error

* Folder can't expand if filter project


#### 0.1.0 2017-07-24