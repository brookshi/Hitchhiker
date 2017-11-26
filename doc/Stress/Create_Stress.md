Go to Stress test Module and click `create stress test` button.

Pop a new stress test dialog:

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stress/stress_create.png)

**Name**: name of this stress test.
**Collection**: select a collection which you want to run.
**Requests**: Filter and Sort requests.
**Repeat**: repeat times.
**Concurrency**: concurrency.
**QPS**: query per second for a worker, default is 0 (no limit).
**Timeout**: timeout (second)，default is 0 (worker never timeout).
**Keeplive**: set Keeplive for each request.
**Environment**: request will run in this environment.

Hit OK button to create a stress test.