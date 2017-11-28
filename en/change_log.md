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