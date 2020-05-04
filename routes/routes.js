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

module.exports = function(app, passport) {

    app.get('/api/tasks', function (req, res) {
        // get all tasks from the database
        getTasks(res);
    });

    // create a task and return all tasks after creation
    app.post('/api/tasks', function (req, res) {

        console.log("Backend received: " + JSON.stringify(req.body, null, 4));

        // create a task based on the input from Angular
        db.Task.create({
            title: req.body.title,
            details: req.body.details,
            dueDate: req.body.dueDate,
            done: false
        }, function (err, task) {
            if (err)
                res.send(err);

            getTasks(res);
        });

    });

    // delete a task
    app.delete('/api/tasks/:task_id', function (req, res) {
        db.Task.remove({
            _id: req.params.task_id
        }, function (err, task) {
            if (err)
                res.send(err);

            getTasks(res);
        });
    });


    app.post("/api/tasks/:task_id", function(req,res){
            // get the values posted
            var task = {
                title: req.sanitize('title').escape().trim(),
                details: req.sanitize('details').escape().trim(),
                dueDate: req.sanitize('dueDate').escape().trim(),
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
        req.logOut();
        res.send(200);
    })

    // loggedin
    app.get("/loggedin", function(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });


}


function isLoggedIn(req, res, next){
    if (req.isAuthenticated())
     return next();
   
    res.redirect('/login');
}
