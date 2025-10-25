## Technologies Used
- Node.js - A runtime environment based off of Chrome's V8 Engine for writing Javascript server-side applications. [Nodejs.org](https://nodejs.org/)
- NestJS - A progressive Node.js framework for building efficient, reliable and scalable server-side applications. [NestJS](https://nestjs.com/)
- PostgreSQL - An open source object-relational database system that uses and extends the SQL language. [PostgreSQL](https://www.postgresql.org/)
- TypeORM - An ORM that can run in NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript. [TypeORM](https://typeorm.io/#/)
- Docker - A set of platform as a service products that use OS-level virtualization to deliver software in packages called containers. [Docker](https://www.docker.com/)
- AWS S3 - Amazon Simple Storage Service is a service offered by Amazon Web Services that provides object storage through a web service interface. [AWS S3](https://aws.amazon.com/s3/)
- AWS SNS - Amazon Simple Notification Service is a fully managed messaging service for both application-to-application and application-to-person communication. [AWS SNS](https://aws.amazon.com/sns/)
- TypeScript - An open-source language which builds on JavaScript, one of the world’s most used tools, by adding static type definitions. [TypeScript](https://www.typescriptlang.org/)
- Swagger - An open-source software framework backed by a large ecosystem of tools that helps developers design, build, document, and consume RESTful web services. [Swagger](https://swagger.io/)
- Jest - A delightful JavaScript Testing Framework with a focus on simplicity. [Jest](https://jestjs.io/)
- Supertest - A high-level abstraction for testing HTTP, while still allowing you to drop down to the lower-level API provided by superagent. [Supertest](https://www.npmjs.com/package/supertest)
- Github Actions - A CI/CD tool that helps automate the process of software development. [Github Actions]('https://github.com')
- Nginx - An open-source web server that can also be used as a reverse proxy, load balancer, mail proxy, and HTTP cache. [Nginx](https://www.nginx.com/)

## Endpoints
### Admin
- POST /api/admin/add-admin - Add a new admin

### Auth
- POST /api/auth/signup - Create a new user
- POST /api/auth/login - Login a user

### User
- POST /api/users/login - Login a user
- GET /api/users - Get all users
- GET /api/users/:id - Get a user by id

### Property
- POST /api/properties - Create a new property