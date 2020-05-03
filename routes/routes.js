var db = require('../config/database.js');

var path = require('path');

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
    app.get('*', function (req, res) {
        // load the single view file (angular will handle the page changes on the front-end)
        res.sendFile(path.resolve('public/index.html'));
    });


    /*

    app.get("/", function(req,res){
        console.log("Zaza")
        res.redirect("/tasks"); 
     });

    app.get("/tasks", function(req,res){
        var errorMsg = "";
        db.Task.find({}).sort([['created', -1]]).limit(10).lean().exec(function(err,tasks){
        if(err){
            console.log("Error getting tasks "  + err); //Better to write to error log
            errorMsg = "Apologies, we were unable to get the list of tasks.  If this problem persists please contact an Admin.  <br/><a href='/'> Homepage </a>";
        }  else {
            res.render('list', {
                errorMsg: errorMsg,
                tasks: tasks});
        }
        });
    });

    app.get("/tasks/new", isLoggedIn, function(req,res){
       res.render("new"); 
    });

    app.post('/tasks', isLoggedIn, function(req, res){
        req.assert('title', 'Task title is required').notEmpty();
        req.assert('details', 'Task details is required').notEmpty();
        req.assert('dueDate', 'Task due date is required').notEmpty();
        var errors = req.validationErrors();

        var task = {
                title: req.sanitize('title').escape().trim(),
                details: req.sanitize('details').escape().trim(),
                dueDate: req.sanitize('dueDate').escape().trim()  
        }	
        if( !errors ) {   //No errors were found.     	             
            db.Task.create(task,function(err,task){
                    if (err) {
                        res.render("new");
                    } else{
                        res.redirect("/tasks");
                    }
                });		
        }
        else {   //Display errors eg title left blank
            var errorMsg = ''
            errors.forEach(function(error) {
                errorMsg += error.msg + '<br>'
            })			
            res.render('new', { 
                errorMsg: errorMsg,
                title: task.title,
                details: task.details,
                dueDate: task.dueDate
            })
        }
    });

    app.get("/tasks/:id", function(req, res){
        var errorMsg = "";
        // Make the id safe
        var id =  req.sanitize('id').escape().trim();
        db.Task.findById(id).lean().exec(function(err,foundTask){
            if(err){
                res.redirect("/tasks");
            } else{
                res.render("show",{task: foundTask});
            }
        }); 
    });

    app.get("/tasks/:id/edit", isLoggedIn, function(req,res){
        var errorMsg = "";
        var id = req.sanitize('id').escape().trim();
            
        db.Task.findById(req.params.id).lean().exec(function(err,foundTask){
            if(err){
                res.redirect("/tasks");
            } else{
                res.render("edit",{task: foundTask});
            }
        }); 
    });

    app.post("/tasks/:id", isLoggedIn, function(req,res){
        req.assert('title', 'Task title is required').notEmpty();
        req.assert('details', 'Task details is required').notEmpty();
        req.assert('dueDate', 'Task due date details is required').notEmpty() ;
        var errors = req.validationErrors();
        var errorMsg = "";

        // get the values posted
        var task = {
            title: req.sanitize('title').escape().trim(),
            details: req.sanitize('details').escape().trim(),
            dueDate: req.sanitize('dueDate').escape().trim()
        }	
        
        db.Task.findByIdAndUpdate(req.params.id, task,function(err, updatedTask){
        if(err){
            console.log("Error editing task"  + err);
            res.redirect("/tasks");
        } else{
            console.log("Edited task post with "  + req.params.id);
            res.redirect("/tasks/"+req.params.id);
        }
      })
    });

    app.get("/tasks/:id/delete", isLoggedIn, function(req,res){
        var errorMsg = "";
        var id = req.sanitize('id').escape().trim();
        console.log("Deleting a task with id "  + req.params.id);
        db.Task.findByIdAndRemove(req.params.id,function(err){
            if(err){
                res.redirect("/tasks");
            } else{
                res.redirect("/tasks");
            }
        });
    });

    app.get("/login", (req, res) => {
        res.render("login")
    });

    app.post("/login", passport.authenticate("local-login", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
    );

    app.get('/signup',(req,res) => {
        res.render('signup');
    })

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/signup',
        failureFlash : true
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    */ 

}

/*
function isLoggedIn(req, res, next){
    if (req.isAuthenticated())
     return next();
   
    res.redirect('/login');
}
*/
