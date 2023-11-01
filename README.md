## Link Deploy

This project was deploy here: [https://boutique-server-dangtrantien.vercel.app](https://boutique-server-dangtrantien.vercel.app)

### This project has following structures:

```
controllers
  │─ admin.js
  │─ auth.js
  └─ shop.js
middleware
  └─ is-auth.js
models
  │─ Order.js
  │─ Product.js
  │─ Session.js
  └─ User.js
public
  └─ images
routes
  │─ admin.js
  │─ auth.js
  └─ shop.js
util
  │─ file.js
  └─ socket.js
.gitignore
app.js
nodemon.json
package-lock.json
package.json
```

- controllers: Folder contains file to take action from folder routes and send data to Client.
- is-auth.js: File contains code to check authentication.
- models: Folder contains file to create data schema.
- images: Folder contains image from client send to server.
- routes: Folder contains file to create Rest API router path.
- file.js: File contains code to delete image from folder images.
- socket.js: File contains code to connect to socket.io for real-time function.
- .gitignore: File contains code to ignore some folder when pushing project on Github.
- app.js: File contains code to initialize the server.
- nodemon.json: File contains code storing env value.
- package.json & package-lock.json: File contains libraries code for building the Website.
