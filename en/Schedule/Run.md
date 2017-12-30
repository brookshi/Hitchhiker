#### Collection run result

Schedule will auto run as its period setting, and will send emails to peoples that set in Notification.
Collection run result will be display automatically in the grid like this:

A row in this grid is a collection run result with columns: 

* Pass:  Are all requests run success and pass test cases.
* Duration: Total duration of this run.
* Description: Description like how many success, how many failed.

A record has a sub table include all requests' run result with columns:

* Param: request's parameter if have.
* Pass: is request's test case pass.
* Duration: duration of a request run.
* Environment: environment of request using.
* Headers, Body: response headers & body of request.
* Test: test case result of request.
  
If this schedule have a comparison environment, a request will have two rows for the two environments.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/schedule/schedule_run.png)

#### Schedule comparision diff

If you choose environment comparision, then a `view diff` button is avaliable if the responses do not match.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/schedule/schedule_diff.png)

#### Schedule Menu

If you want run this collection manually.
Move mouse to menu icon of Schedule item, a menu will pop up like this:

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/schedule/schedule_menu.png)

* Run Now: used to run this collection immediately,and will receive real-time messages of request (base on WebSocket).
* Edit: modify setting of schedule.
* Suspend/Resume: suspend or resume this schedule run automatically.
* Delete: delete this schedule.

#### Run Now interface

There is a `Run now` interface exposed for external applications, the url is: `http://ip:port/api/schedule/{schedule_id}/run`, remember pass http authorization header.
`schedule_id`: you can get it in browser's console while click Run Now.