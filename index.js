var express = require('express')
var exec = require('child_process').exec;
var bodyParser = require('body-parser');
var app = express()

app.use(bodyParser.json());
app.use('/scripts', express.static(__dirname + '/node_modules/'));

app.get('/', function (req, res) {
    res.redirect('/config')
});

app.get('/config/powerOn', function (req, res) {
    exec("vcgencmd display_power 1", function(err, stdout, stderr) {
        console.log("turning on");
    })
})

app.get('/config/powerOff', function (req, res) {
    exec("vcgencmd display_power 0", function(err, stdout, stderr) {
        console.log("turning off");
    })
})

app.get('/config', function(req, res) {
    res.sendFile(__dirname + '/index.html');    
})

app.post('/config/changeTimes', function(req, res) {
    var wakeup = req.body.wakeup.split(":");
    var shutdown = req.body.shutdown.split(":");

    var time = {
        wakeupTime: getSplitTimeArr(wakeup),
        shutdownTime: getSplitTimeArr(shutdown)
    }
    
    var cronTabLineWakeup = getCronString(time.wakeupTime, "vcgencmd display_power 1");
    var cronTabLineShutdown = getCronString(time.shutdownTime, "vcgencmd display_power 0");
    var cronTabServerStart = "@reboot node \/home\/pi\/Documents\/dakboard\/index.js";  
    var args = '"' + cronTabLineWakeup + '" ' + '"' + cronTabLineShutdown + '" ' + '"' +  cronTabServerStart + '"';
    
    console.log("sh /home/pi/Documents/dakboard/changeTime.sh " + args);
    exec("sh /home/pi/Documents/dakboard/changeTime.sh " + args, function(err, stdout, stderr) {
        console.log("changing time");
    });
    res.send({});
})

function getCronString(time, command) {
    return time.minute + " " + time.hour + " \* \* \* " + command;
}

function getSplitTimeArr(time) {
    obj = {};
    obj.hour = time[0];
    obj.minute = time[1].split(" ")[0];
    obj.AMPM = time[1].split(" ")[1];
    obj.hour = getMilitaryHour(obj.hour, obj.AMPM) + "";
    return obj;
}

function getMilitaryHour(hour, AMPM) {
    if (AMPM == 'AM') {
	console.log("AM");
        if (hour == 12) {
            return 0;
        } else {
            return hour;
        }
    } else {
	console.log("PM");
        if (hour != 12) {
            console.log("here " + parseInt(hour));
            return parseInt(hour) + 12;
        } else {
            return hour;
        }
    }
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
