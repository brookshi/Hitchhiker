#### Create collection

Now we have a Project, we can create a Collection for this project.

Collection is a group of many requests with the same property,
it include folder, so the requests can be organized into folder.

Collection is the unit when run Schedule or Stress Test.

Create a Collection:

1. Go to Collection module.

2. Click `create collection` button as below.

3. Enter name `Sample Collection` and select Project `SampleAPI` that we create previously.



After this collection is created, each of project's member can get it with their account.

#### Collection other options

1. Create folder

2. Common Pre Request Script, refer to [Script](../Script/Common_Pre_Script.md)

3. Request Strict SSL: All requests of this collection will check SSL cert if this option is checked.

4. Request Follow Redirect: All request of this collection will follow http 3** redirect if this option is checked.