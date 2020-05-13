#!/usr/bin/env bash

brew tap mongodb/brew

brew install mongodb-community@4.2

brew services start mongodb-community@4.2

brew install nodejs

npm install bcrypt-nodejs@0.0.3
npm install body-parser@^1.19.0
npm install connect-flash@^0.1.1
npm install cookie-parser@~1.4.4
npm install debug@~2.6.9
npm install express@~4.16.1
npm install express-handlebars@^3.1.0
npm install express-session@^1.17.0
npm install express-validator@^5.3.1
npm install hbs@^4.1.1
npm install http-errors@~1.6.3
npm install mongo@^0.1.0
npm install mongoose@^5.9.7
npm install morgan@~1.9.1
npm install passport@^0.4.1
npm install passport-local@^1.0.0
