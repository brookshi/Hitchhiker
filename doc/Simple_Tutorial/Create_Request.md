Two way to create a new Request.
1. Click menu item `Create reuqest` of Collection, this is the recommend way to create a new Request, The new request will auto save to the current Collection and can access Environment variable for current Project.

2. Click + button on the right of tab bar.

Let's create a new Request and save it to Collection `Sample Collection`.
1. Move mouse to the ... of Collection.
2. Click `Create request` menu item.
3. Enter name `Sample Request` in the name text box.
4. Select http method: POST.
5. Enter url: http://httpbin.org/get?env=qa.
6. Enter Header Key: Content-type, Value: application/json.
7. Enter Body: { "Desc": "It's a sample" }.
8. Hit Save button.

Now we have a real request, let's hit Send button to test it.