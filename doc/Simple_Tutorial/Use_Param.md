#### Why need parameters

Parameters is used to build requests with parameters, in general, a Api have several variables which have multiple values in query string or body, you must create lots of Request to cover all cases. 

For example: 
There are 3 variables in your api, every variable have 3 different values, so you need create `3*3*3=27` requests. It's hard.

They are basically the same，so you can use Parameters to handle this situation, just write the variables in `parameters`, Hitchhiker will auto generate requests that you want.

#### Parameters' option

Parameters have two options to compose variables: `Many to Many` and `One to One`. 

For example: there are two parameter `A` and `B`:
`A` has two values: `1` and `2`.
`B` has two values：`3` and `4`.

You will have 4 request if select `Many to Many`： `13, 14, 23, 24`:

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_many.png)

And have 2 for `One to One`：`13, 24`:

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_one.png)

Parameters is a JSON object, you must write it using this format as below:
``` json
{
    "A": [1, 2],
    "B": [3, 4]
}
```

#### Use parameters

Let's edit `Sample Request` to using Parameters.

1. Go to Collection Module, select `Sample Request`, select Body tab of request, now body is `{ "Desc": "It's a sample" }`.

2. Change body to `{ "Desc": "{{param}}" }`.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_body.png)

3. Select Parameters tab of request.

4. Enter `{ "param": [ "Test A", "Test B" ] }`.

5. Hit Save button.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_save.png)

Now you can see Hitchhiker generate two requests for these two params.

Hit Send button to test one or all of them.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_send_all.png)

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_send_one.png)