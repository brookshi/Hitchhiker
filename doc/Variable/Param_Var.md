Parameters variable could be defined in Parameter of request.
it will help you to merge many requests to one, it make API easy to maintain. 

For example, we have a API: `http://httpbin.org/get?boy={{boy}}&girl={{girl}}`, there are two variables in this API.
We can use Parameter and define it like this:
```json
{
    "boy": ["tom", "jerry", "mike"],
    "girl": ["lucy", "lily", "cristina"]
}
```
We will get 3 requests with `OneToOne` option:
```
http://httpbin.org/get?boy=tom&girl=lucy
http://httpbin.org/get?boy=jerry&girl=lily
http://httpbin.org/get?boy=mike&girl=cristina
```
and get 9 requests with `ManyToMany` option:
```
http://httpbin.org/get?boy=tom&girl=lucy
http://httpbin.org/get?boy=tom&girl=lily
http://httpbin.org/get?boy=tom&girl=cristina
http://httpbin.org/get?boy=jerry&girl=lucy
http://httpbin.org/get?boy=jerry&girl=lily
http://httpbin.org/get?boy=jerry&girl=cristina
http://httpbin.org/get?boy=mike&girl=lucy
http://httpbin.org/get?boy=mike&girl=lily
http://httpbin.org/get?boy=mike&girl=cristina
```
All these APIs are in a Request.

We can send all at a time or select one and send.
