var db = require('../config/database.js');
var passportDB = require('../config/passport.js');

function getTasks(res) {
    db.Task.find(function (err, tasks) {

        if (err) {
            // return error
            console.log("Sending error: " + err)
            res.send(err);
        }

        console.log("Got tasks: " + tasks)
        // return all tasks in JSON format
        res.json(tasks);
    });
};

function getTasksByUser(userID, res) {
    if (userID != undefined) {
        db.Task.find({ $or: [ { owner: {$in: [userID] } }, { users: {$in: [userID] } } ] }, function (err, tasks) {
            if (err) {
                // return error
                console.log("Sending error: " + err)
                res.send(err);
            } else {
                console.log("Got tasks by userID: " + tasks)
                if (tasks != undefined) {
                    // return all tasks in JSON format
                    res.json(tasks);
                } else {
                    console.log("Could not get tasks for userID: " + userID);
                }
            }
        });
    };
};


function getUsers(res) {
    passportDB.User.find(function (err, users) {

        if (err) {
            // return error
            console.log("Sending error: " + err)
            res.send(err);
        }

        console.log("Got users: " + users)
        // return all users in JSON format
        res.json(users);
    });
};



const addUserToTasks = function(userID, taskID, res) {
    return db.Task.findByIdAndUpdate(
      taskID,
      { $push: { users: userID } },
      { new: true, useFindAndModify: false }, 
      function(err){    
        if (err){
            console.log("Error assigning user: "  + err);
        } else{
            console.log("Assigned task to a suer ");
        }
     })
  };

module.exports = function(app, passport) {

    app.get('/api/users', function (req, res) {
        // get all users from the database
        getUsers(res);
    });

    app.get('/api/tasks', function (req, res) {
        // get all tasks from the database
        getTasks(res);
    });

    app.get('/api/tasks/users/:user_id', function (req, res) {
        var userID = req.params.user_id
        console.log("Get tasks by userID: " + userID);
        if ( userID != undefined) {
            // get all tasks by the userID from the database
            getTasksByUser(userID, res);
        }
    });    

    // assign a task to a user
    app.post('/api/tasks/users/:user_id', isLoggedIn, function (req, res) {
        console.log("User assignment received, user_id: " 
        + req.params.user_id + ", task_id: " + req.body._id);
        addUserToTasks(req.params.user_id, req.body._id, res);
    });    

    // create a task and return all tasks after creation
    app.post('/api/tasks', isLoggedIn, function (req, res) {

        console.log("Backend received: " + JSON.stringify(req.body, null, 4));

        // create a task based on the input from Angular
        db.Task.create({
            title: req.body.title,
            details: req.body.details,
            dueDate: req.body.dueDate,
            priority: req.body.priority,
            owner: req.body.owner,
            done: false,
        }, function (err, task) {
            if (err)
                res.send(err);

            getTasks(res);
        });

    });

    // delete a task
    app.delete('/api/tasks/:task_id', isLoggedIn, function (req, res) {
        db.Task.remove({
            _id: req.params.task_id
        }, function (err, task) {
            if (err)
                res.send(err);

            getTasks(res);
        });
    });


    app.post("/api/tasks/:task_id", isLoggedIn, function(req,res){
        console.log("Backend received request for update: " + JSON.stringify(req.body, null, 4));

            // get the values posted
            var task = {
                title: req.sanitize('title').escape().trim(),
                details: req.sanitize('details').escape().trim(),
                dueDate: req.sanitize('dueDate').escape().trim(),
                priority: req.body.priority? req.body.priority: "low",
                done: req.body.done
            }
        
            db.Task.findByIdAndUpdate(req.params.task_id, task, function(err, task){
                    if(err){
                        console.log("Error editing task"  + err);
                        res.redirect("/tasks");
                    } else{
                        console.log("Edited task post with "  + req.params.id);
                        getTasks(res);
                    }
            })
        }       
    )

    // application -------------------------------------------------------------
    /*
    app.get('*', function (req, res) {
        // load the single view file (angular will handle the page changes on the front-end)
        res.sendFile(path.resolve('public/index.html'));
    });
    */

    // signup
    app.post("/signup", function(req, res, next) {
        passportDB.User.findOne({
          username: req.body.username
        }, function(err, user) {
    
          if (user) {
            res.json(null);
            return;
          } else {
            var newUser = new passportDB.User();
            newUser.userName = req.body.username.toLowerCase();
            newUser.password = newUser.generateHash(req.body.password);

            newUser.save(function(err, user) {
              req.login(user, function(err) {
                if (err) {
                  return next(err);
                }

                res.json(user);

              });
            });
          }
        });
      });


    // process the login form
    app.post("/login", passport.authenticate('local-login'), function(req, res) {
       res.json(req.user);
      });
  
    // handle logout
    app.post("/logout", function(req, res) {
        console.log("Logout invoked");
        req.logOut();
        res.send(200);
    })

    // loggedin
    app.get("/loggedin", function(req, res) {
        console.log("Loggedin invoked. req.user: " + req.user)
        res.send(req.isAuthenticated() ? req.user : '0');
    });
}


function isLoggedIn(req, res, next){
    if (req.isAuthenticated())
     return next();
   
    res.redirect('/login');
}
