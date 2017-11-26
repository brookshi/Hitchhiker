Hitchhiker has a powerful runtime script that allows you to adjust request before/after sending. You can prepare some data for request and add test case to verify response.

There are 3 level script:

1. [Global function](Global_Func.md) in Project level.

2. [Common Pre Request Script](Common_Pre_Script.md) in Collection level.

3. [Pre Request Script](Pre_Script.md) and [Test Script](Test.md) in Request level.

Scripts are written in Javascript, support ES6. (Stress Test doesn't support ES6 and Pre Request Script right now, will be fixed at once)

Script API reference to: [Script API](API.md).

Custom javascript lib refer to: [Custom Javascript Lib](custom-javascript-lib.md).

Custom data file refer to: [Custom Data File](custom-data-file.md).

Below is workflow of Hitchhiker's request included script and variable.


![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/request_wf.png)