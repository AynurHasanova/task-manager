//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/tasks';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log("Successfully connected to MongoDB!");
});

var taskSchema = new mongoose.Schema({
    title: {type: String, trim: true},
    details: {type: String, trim: true},
    dueDate: Date,
    priority: {type: String, trim: true, default: "low"},
    created: {type:Date, default: Date.now},
    done: Boolean,
    users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
    ]
});

var Task = mongoose.model("Task", taskSchema);

module.exports.Task = Task;