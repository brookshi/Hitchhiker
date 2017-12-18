Hitchhiker has two ways to do stress test. [Hitchhiker-Node](https://github.com/brookshi/Hitchhiker-Node) Base on Go, and another base on Nodejs build-in function of Hitchhiker.

Default is use function base on Nodejs and Hitchhiker-Node will be deprecated unless Golang have a js interpreter base on Nodejs.

As same as Schedule, the unit of Stress test is Collection too, you can sort requests, set concurrency to emulate a real customer scenario.

Follow these step to run a Stress Test:

1. [Create a Stress Test](Create_Stress.md).

2. [Run a Stress Node](Node.md). // ignore unless you want to use Hitchhiker-Node

3. [Run](Run.md).