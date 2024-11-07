## MCV Architecture

- Model
- View
- Controller
- Utils

'fail' is client side
'error' is server side

### Todo: build the api

- req body parse
- server static files : if we hit a url which is not defined, it will check in the public folder and server the static files
- req parameters : the params will be string. Optional parameter have a trailing ?
- req query string
- req cookies
- environment variables

- setup the database
- connect to database

##

> Making queries / query chaining:

- Model.find, Model.finbyId etc returns a query object, we can then use await to chain and execute queries.
  we can use await then to execute query and retrun the document that matches the query

  example: Tour.find(); this return a query object
  await Tour.find(); await will execute the query object

##

> Validators:

- update queries will not run validators on the schema by default
  validators are someting like minlength: 3 OR custom validatiors,
  to run validators on updates, we need to specify in options {runValidators: true}
  Note: unique:true is not a validator, so it will run even if the runValidators: true is not specified in updates
  type: String is also not a validator

- the value of 'this'
  case 1) in cases of create/save new documents 'this' will refer to the current processed document
  case 2) in cases of update documents 'this' will refer to the current query and not the document
  because: When Mongoose performs an update, it doesn’t load the document into memory; it applies the update directly to the database.
- custom validators
  return false means error
  return true means success

##

> Virtual properties:

- we cannot request virtual properties as they are not persisted in the database

##

> Documents middlewares (pre, post - triggered on save and create, but not on updates, insert many):

- it acts on the currently processed document. 'This' will refer to the current processed document.

##

> Query middlewares (pre, post - find, findOne etc, has to be specified):

- it acts on the currently processed query. 'this' will refer to the current processed query. We can then modify the query.

> Instance methods:

- are available on the documents of a collection and are defined using the schema
  example: userSchema.methods.checkPassowrd = function(){....}
  user.checkPassowrd()

> Aggregate middlewares

> Modles middlewares

Data Validators → Pre Middlewares → Virtual Properties → Post Middlewares

##

> Global Error Handling Middleware:

- if a middleware is defined with four parameters, then express will automatically recognize it as a error handler middleware
- to call this error middleware simply call next(argument);
- if we call next with an argument then immediately the error handler middleware will be called, this will be applicable from anywhere in the application

- choose how to handle errors in development and in production

- note: if anytime there is an error in a middleware which we have not handled, the error will be immediately be given to the global error handler middleware

##

> Handle unhandled rejections:

- In Node.js, an "unhandled rejection" occurs when a promise is rejected, but there’s no .catch() handler to handle that rejection.
- Node.js provides a way to handle all unhandled rejections globally:

  process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Optionally: log the error, attempt to recover, or restart the app
  });

##

> Handle uncaught exceptions:

- An "uncaught exception" is a synchronous error that is thrown but not caught anywhere in your code, which would normally cause the application to crash.

- An "unhandled exception" can be handled globally as well:

  process.on('uncaughtException', (error) => {
  console.error('Unhandled Exception:', error);
  // Optionally, perform cleanup or restart the server
  });

#

> Passwords saving

- Always save encrypted passwords into the database
- Implement forgot password feature also.
