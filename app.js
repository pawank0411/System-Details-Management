const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const port = 4000;
var session = require('express-session')
var cookieparser = require('cookie-parser')
const flash = require('express-flash-notification');
var fs = require('fs');
const path = require('path');
var upload1 = require('express-fileupload');
app.use(upload1());
var temp = require('fs-temp');
var xlsxtojson = require("xlsx-to-json");
var converter = require('json-2-csv');
const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/sys_details';

const flashNotificationOptions = {
    beforeSingleRender: function (item, callback) {
        if (item.type) {
            switch (item.type) {
                case 'Success-form':
                    item.type = 'Submitted Successfully!!';
                    item.alertClass = 'alert-success';
                    break;
                case 'Error-form':
                    item.type = 'Soory, Submission Failed!';
                    item.alertClass = 'alert-danger';
                    break;
                case 'No-Data':
                    item.type = 'No data found.';
                    item.alertClass = 'alert-info';
                    break;
                case 'No-Data':
                    item.type = 'No data found.';
                    item.alertClass = 'alert-info';
                    break;
                case 'Error-retrive':
                    item.type = 'Soory, an error occurred';
                    item.alertClass = 'alert-danger';
                    break;
                case 'Success-retrive':
                    item.type = 'Retrived Successfully!!';
                    item.alertClass = 'alert-success';
                    break;
                case 'Delete':
                    item.type = 'Deleted Successfully';
                    item.alertClass = 'alert-danger';
                    break;
                case 'Retrive-Error':
                    item.type = 'Soory, retrive failed'
                    item.alertClass = 'alert-danger';
                    break;
                case 'Retrive-Success':
                    item.type = 'Retrived Successfully!!';
                    item.alertClass = 'alert-success';
                    break;
                case 'Import':
                    item.type = 'Please import file';
                    item.alertClass = 'alert-info';
                    break;
                case 'Export-Success':
                    item.type = 'Exported Successfully!!';
                    item.alertClass = 'alert-success';
                    break;
                case 'Export-Error':
                    item.type = 'Soory, export failed'
                    item.alertClass = 'alert-danger';
                    break;
                case 'Update':
                    item.type = 'DataBase Updated';
                    item.alertClass = 'alert-success';
                    break;
                case 'Browse_err':
                    item.type = 'Please browse a file.';
                    item.alertClass = 'alert-danger';
                    break;
                case 'Path_err':
                    item.type = 'Soory, path error';
                    item.alertClass = 'alert-danger';
                    break;
                case 'Excel_err':
                    item.type = 'Please import excel file';
                    item.alertClass = 'alert-warning';
                    break;
                case 'type-Error':
                    item.type = 'Please Select Query Type';
                    item.alertClass = 'alert-info';
                    break;
            }
        }
        callback(null, item);
    }
};


app.use(cookieparser('secret123'));
app.use(session({
    secret: "secret123",
    saveUninitialized: true,
    resave: true
}));
app.use(flash(app, flashNotificationOptions));

var db = mongoose.connection;
db.on('error', console.log.bind(console, "Connection error"));
db.once('open', function (callback) {
    console.log('Connection Succeded');
})

mongoose.connect(mongoURI);


/**
 * Import File Setup
 */

var name;

app.post('/upload', function (req, res) {
    if (!req.files) {
        console.log('Please browse the file.')
        req.flash('Browse_err', '', '/import')
    } else {
        console.log(req.files);
        file = req.files;
        name = file.file.name;
        console.log(name);
        var data = new Buffer(file.file.data)
        var path = temp.writeFileSync(data)
        console.log(path);

        fs.readFile(path, { encoding: 'utf-8' }, function (err, data) {
            if (err) {
                console.log(err);
                req.flash('Path_err', '', '/import');
            } else {
                console.log(path);
                var ext = name.split('.').pop();
                if (ext == 'xlsx') {
                    xlsxtojson({
                        input: path,  // input xls 
                        output: "output.json", // output json 
                        lowerCaseHeaders: true
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                            console.log('Please upload xlsx files');
                            req.flash('Excel_err', '', '/import');
                        } else {
                            db.collection('Details').insertMany(result, function (err, collection) {
                                if (err) {
                                    console.log(err);
                                    req.flash('Error-form', '', '/import');
                                } else {
                                    req.flash('Update', '', '/');
                                    dat = [];
                                }
                            })
                        }
                    })

                } else {
                    req.flash('Excel_err', '', '/import');
                }
            }
        })
    }
});

app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});

app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // File exists
        return res.json(file);
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/js"));
app.use(express.static(__dirname + "/css"));
app.set('view engine', 'ejs');

app.post('/details_save', function (req, res) {
    var status = req.body.examplestatus;
    var user_name = req.body.exampleusername;
    var asset_type = req.body.exampleassettype;
    var hostname = req.body.examplehostname;
    var department = req.body.exampledepart;
    var location = req.body.examplelocation;
    var protocol = req.body.exampleprotocols;
    var model = req.body.examplemodel;
    var modelDesp = req.body.exampleModelDescp;
    var serialNumber = req.body.exampleserailNumber;
    var install_date = req.body.exampleinstall;
    var wg = req.body.exampleworkgroup;
    var ad = req.body.domain;
    var vnc = req.body.examplevnc;
    var lync = req.body.examplelync;
    var quiz = req.body.examplequiz;
    var combolt = req.body.examplecombolt;
    var sccm = req.body.examplesccm;
    var antiv = req.body.exampleantivirus;
    var vts = req.body.examplevts;
    var shutdown = req.body.exampleshutdown;
    var pi = req.body.examplepi;
    var data_pro = req.body.examplepro;
    var data_link = req.body.exampledatalink;

    var data = {
        "Status": status,
        "Username": user_name,
        "Asset_Type": asset_type,
        "Hostname": hostname,
        "Department": department,
        "Location": location,
        "TCP_IP": protocol,
        "Model": model,
        "Model_Desp": modelDesp,
        "Serial_Number": serialNumber,
        "Installation_Date": install_date,
        "WG": wg,
        "AD": ad,
        "VNC": vnc,
        "LYNC": lync,
        "Safety_Quiz": quiz,
        "Combolt": combolt,
        "SCCM": sccm,
        "Anti_Virus": antiv,
        "VTS": vts,
        "ShutDown": shutdown,
        "PI": pi,
        "Data_Pro": data_pro,
        "Data_Link": data_link
    };
    db.collection('Details').insertOne(data, function (err, collection) {
        if (err) {
            console.log(err);
            req.flash('Error-form', '', '/form');
        } else {
            console.log('Record Inserted Successfully');
            req.flash('Success-form', '', '/form');
        }
    });
})

var datas = [];
var length;
var primary;
app.post('/search', function (req, res) {
    if (!datas == []) {
        datas = [];
    }
    primary = req.body.exampleprimary
    console.log(primary);
    db.collection('Details').find({ 'Serial_Number': primary }).toArray((err, docs) => {
        if (err) {
            console.log(err);
            req.flash('Error-retrive', '', '/search');
        } else {
            req.flash('Success-retrive', '', '');
            console.log(docs);
            length = docs.length;
            console.log(length);
            var i;
            for (i = 0; i < length; i++) {
                datas.push({
                    primary_key: primary,
                    status: docs[i].Status,
                    user_name: docs[i].Username,
                    asset_type: docs[i].Asset_Type,
                    hostname: docs[i].Hostname,
                    department: docs[i].Department,
                    location: docs[i].Location,
                    protocol: docs[i].TCP_IP,
                    model: docs[i].Model,
                    modelDesp: docs[i].Model_Desp,
                    serialNumber: docs[i].Serial_Number,
                    install_date: docs[i].Installation_Date,
                    wg: docs[i].WG,
                    ad: docs[i].AD,
                    vnc: docs[i].VNC,
                    lync: docs[i].LYNC,
                    quiz: docs[i].Safety_Quiz,
                    combolt: docs[i].Combolt,
                    sccm: docs[i].SCCM,
                    antiv: docs[i].Anti_Virus,
                    vts: docs[i].VTS,
                    shutdown: docs[i].ShutDown,
                    pi: docs[i].PI,
                    data_pro: docs[i].Data_Pro,
                    data_link: docs[i].Data_Link,
                    del_id: docs[i]._id
                });
            }
            if (!docs.length) {
                res.redirect('/hostname');
            } else {
                res.redirect('/c')
            }
        }
    });
})

app.get('/hostname', function (req, res) {
    if (!datas == []) {
        datas = [];
    }
    console.log(primary);
    db.collection('Details').find({ 'Hostname': primary }).toArray((err, docs) => {
        if (err) {
            console.log(err);
            req.flash('Error-retrive', '', '/search');
        } else {
            req.flash('Success-retrive', '', '');
            console.log(docs);
            length = docs.length;
            console.log(length);
            var i;
            for (i = 0; i < length; i++) {
                datas.push({
                    primary_key: primary,
                    status: docs[i].Status,
                    user_name: docs[i].Username,
                    asset_type: docs[i].Asset_Type,
                    hostname: docs[i].Hostname,
                    department: docs[i].Department,
                    location: docs[i].Location,
                    protocol: docs[i].TCP_IP,
                    model: docs[i].Model,
                    modelDesp: docs[i].Model_Desp,
                    serialNumber: docs[i].Serial_Number,
                    install_date: docs[i].Installation_Date,
                    wg: docs[i].WG,
                    ad: docs[i].AD,
                    vnc: docs[i].VNC,
                    lync: docs[i].LYNC,
                    quiz: docs[i].Safety_Quiz,
                    combolt: docs[i].Combolt,
                    sccm: docs[i].SCCM,
                    antiv: docs[i].Anti_Virus,
                    vts: docs[i].VTS,
                    shutdown: docs[i].ShutDown,
                    pi: docs[i].PI,
                    data_pro: docs[i].Data_Pro,
                    data_link: docs[i].Data_Link,
                    del_id: docs[i]._id
                });
            }
            res.redirect('/c')
        }
    });
})

app.get('/c', function (req, res) {
    var i;
    var rec = [];
    for (i = (length - 1); i < length; i++) {
        rec = datas[i];
    }
    if (rec == null) {
        console.log('No data Found');
        req.flash('No-Data', '', '/search');
    }
    else {
        res.render('search_s', {
            exampleprimary: rec.primary_key,
            examplestatus: rec.status,
            exampleusername: rec.user_name,
            exampleassettype: rec.asset_type,
            examplehostname: rec.hostname,
            exampledepart: rec.department,
            examplelocation: rec.location,
            exampleprotocols: rec.protocol,
            exampleModel: rec.model,
            exampleModelDescp: rec.modelDesp,
            exampleserailNumber: rec.serialNumber,
            exampleinstall: rec.install_date,
            exampleworkgroup: rec.wg,
            exampledomain: rec.ad,
            examplevnc: rec.vnc,
            examplelync: rec.lync,
            examplequiz: rec.quiz,
            examplecombolt: rec.combolt,
            examplesccm: rec.sccm,
            exampleantivirus: rec.antiv,
            examplevts: rec.vts,
            exampleshutdown: rec.shutdown,
            examplepi: rec.pi,
            examplepro: rec.data_pro,
            exampledatalink: rec.data_link
        });
    }
})

var data_ed;
app.get('/edit', function (req, res) {
    console.log(req.body)
    var i;
    var rec = [];
    for (i = (length - 1); i < length; i++) {
        rec = datas[i];
    }
    if (rec == null) {
        console.log('No Data');
        req.flash('No-Data', '', '/search');
    }
    else {
        res.render('edit', {
            examplestatus: rec.status,
            exampleusername: rec.user_name,
            exampleassettype: rec.asset_type,
            examplehostname: rec.hostname,
            exampledepart: rec.department,
            examplelocation: rec.location,
            exampleprotocols: rec.protocol,
            exampleModel: rec.model,
            exampleModelDescp: rec.modelDesp,
            exampleserailNumber: rec.serialNumber,
            exampleinstall: rec.install_date,
            exampleworkgroup: rec.wg,
            exampledomain: rec.ad,
            examplevnc: rec.vnc,
            examplelync: rec.lync,
            examplequiz: rec.quiz,
            examplecombolt: rec.combolt,
            examplesccm: rec.sccm,
            exampleantivirus: rec.antiv,
            examplevts: rec.vts,
            exampleshutdown: rec.shutdown,
            examplepi: rec.pi,
            examplepro: rec.data_pro,
            exampledatalink: rec.data_link
        });
    }
})

app.post('/edit_save', function (req, res) {
    var status = req.body.examplestatus;
    var user_name = req.body.exampleusername;
    var asset_type = req.body.exampleassettype;
    var hostname = req.body.examplehostname;
    var department = req.body.exampledepart;
    var location = req.body.examplelocation;
    var protocol = req.body.exampleprotocols;
    var model = req.body.examplemodel;
    var modelDesp = req.body.exampleModelDescp;
    var serialNumber = req.body.exampleserailNumber;
    var install_date = req.body.exampleinstall;
    var wg = req.body.exampleworkgroup;
    var ad = req.body.domain;
    var vnc = req.body.examplevnc;
    var lync = req.body.examplelync;
    var quiz = req.body.examplequiz;
    var combolt = req.body.examplecombolt;
    var sccm = req.body.examplesccm;
    var antiv = req.body.exampleantivirus;
    var vts = req.body.examplevts;
    var shutdown = req.body.exampleshutdown;
    var pi = req.body.examplepi;
    var data_pro = req.body.examplepro;
    var data_link = req.body.exampledatalink;

    data_ed = {
        "Status": status,
        "Username": user_name,
        "Asset_Type": asset_type,
        "Hostname": hostname,
        "Department": department,
        "Location": location,
        "TCP_IP": protocol,
        "Model": model,
        "Model_Desp": modelDesp,
        "Serial_Number": serialNumber,
        "Installation_Date": install_date,
        "WG": wg,
        "AD": ad,
        "VNC": vnc,
        "LYNC": lync,
        "Safety_Quiz": quiz,
        "Combolt": combolt,
        "SCCM": sccm,
        "Anti_Virus": antiv,
        "VTS": vts,
        "ShutDown": shutdown,
        "PI": pi,
        "Data_Pro": data_pro,
        "Data_Link": data_link
    };
    db.collection('Details').insertOne(data_ed, function (err, collection) {
        if (err) {
            console.log(err);
            req.flash('Error-form', '', '/form');
        } else {
            console.log('Record Inserted Successfully');
            req.flash('Success-form', '', '/form');
        }
    });
})

app.get('/history', function (req, res) {
    var i;
    var rec = [];
    for (i = 0; i < length; i++) {
        rec.push({
            status: datas[i].status,
            asset_type: datas[i].asset_type,
            user_name: datas[i].user_name,
            hostname: datas[i].hostname,
            department: datas[i].department,
            location: datas[i].location,
            protocol: datas[i].protocol,
            model: datas[i].model,
            modelDesp: datas[i].modelDesp,
            serialNumber: datas[i].serialNumber,
            install_date: datas[i].install_date,
            wg: datas[i].wg,
            ad: datas[i].ad,
            vnc: datas[i].vnc,
            lync: datas[i].lync,
            quiz: datas[i].quiz,
            combolt: datas[i].combolt,
            sccm: datas[i].sccm,
            antiv: datas[i].antiv,
            vts: datas[i].vts,
            shutdown: datas[i].shutdown,
            pi: datas[i].pi,
            data_pro: datas[i].data_pro,
            data_link: datas[i].data_link,
            del_id: datas[i]._id
        })
    }
    if (rec == null) {
        console.log('No data Found');
        req.flash('No-Data', '', '/search');
    }
    else {
        res.render('history', {
            examplestatus: rec[0].status,
            exampleusername: rec[0].user_name,
            exampleassettype: rec[0].asset_type,
            examplehostname: rec[0].hostname,
            exampledepart: rec[0].department,
            examplelocation: rec[0].location,
            exampleprotocols: rec[0].protocol,
            exampleModel: rec[0].model,
            exampleModelDescp: rec[0].modelDesp,
            exampleserailNumber: rec[0].serialNumber,
            exampleinstall: rec[0].install_date,
            exampleworkgroup: rec[0].wg,
            exampledomain: rec[0].ad,
            examplevnc: rec[0].vnc,
            examplelync: rec[0].lync,
            examplequiz: rec[0].quiz,
            examplecombolt: rec[0].combolt,
            examplesccm: rec[0].sccm,
            exampleantivirus: rec[0].antiv,
            examplevts: rec[0].vts,
            exampleshutdown: rec[0].shutdown,
            examplepi: rec[0].pi,
            examplepro: rec[0].data_pro,
            exampledatalink: rec[0].data_link
        });
    }
})
var rec = [];
var j = 0;
app.get('/next', function (req, res) {
    if (!rec == []) {
        rec = [];
    }
    var i;

    for (i = 0; i < length; i++) {
        rec.push({
            status: datas[i].status,
            asset_type: datas[i].asset_type,
            user_name: datas[i].user_name,
            hostname: datas[i].hostname,
            department: datas[i].department,
            location: datas[i].location,
            protocol: datas[i].protocol,
            model: datas[i].model,
            modelDesp: datas[i].modelDesp,
            serialNumber: datas[i].serialNumber,
            install_date: datas[i].install_date,
            wg: datas[i].wg,
            ad: datas[i].ad,
            vnc: datas[i].vnc,
            lync: datas[i].lync,
            quiz: datas[i].quiz,
            combolt: datas[i].combolt,
            sccm: datas[i].sccm,
            antiv: datas[i].antiv,
            vts: datas[i].vts,
            shutdown: datas[i].shutdown,
            pi: datas[i].pi,
            data_pro: datas[i].data_pro,
            data_link: datas[i].data_link,
            del_id: datas[i]._id
        })
    }
    if (rec == null) {
        console.log('No data Found');
        req.flash('No-Data', '', '/search');
    }
    else {
        console.log(j);
        j++;
        console.log(j);
        if (j == length) {
            req.flash('No-Data', '', '/history');
            j--;
        } else {
            console.log(rec[j]);
            res.render('history', {
                examplestatus: rec[j].status,
                exampleusername: rec[j].user_name,
                exampleassettype: rec[j].asset_type,
                examplehostname: rec[j].hostname,
                exampledepart: rec[j].department,
                examplelocation: rec[j].location,
                exampleprotocols: rec[j].protocol,
                exampleModel: rec[j].model,
                exampleModelDescp: rec[j].modelDesp,
                exampleserailNumber: rec[j].serialNumber,
                exampleinstall: rec[j].install_date,
                exampleworkgroup: rec[j].wg,
                exampledomain: rec[j].ad,
                examplevnc: rec[j].vnc,
                examplelync: rec[j].lync,
                examplequiz: rec[j].quiz,
                examplecombolt: rec[j].combolt,
                examplesccm: rec[j].sccm,
                exampleantivirus: rec[j].antiv,
                examplevts: rec[j].vts,
                exampleshutdown: rec[j].shutdown,
                examplepi: rec[j].pi,
                examplepro: rec[j].data_pro,
                exampledatalink: rec[j].data_link
            });
        }
    }
})

app.get('/prev', function (req, res) {
    if (!rec == []) {
        rec = [];
    }
    if (j == 0) {
        console.log('No data')
        req.flash('No-Data', '', '/history');
    } else {
        var i;
        for (i = 0; i < length; i++) {
            rec.push({
                status: datas[i].status,
                asset_type: datas[i].asset_type,
                user_name: datas[i].user_name,
                hostname: datas[i].hostname,
                department: datas[i].department,
                location: datas[i].location,
                protocol: datas[i].protocol,
                model: datas[i].model,
                modelDesp: datas[i].modelDesp,
                serialNumber: datas[i].serialNumber,
                install_date: datas[i].install_date,
                wg: datas[i].wg,
                ad: datas[i].ad,
                vnc: datas[i].vnc,
                lync: datas[i].lync,
                quiz: datas[i].quiz,
                combolt: datas[i].combolt,
                sccm: datas[i].sccm,
                antiv: datas[i].antiv,
                vts: datas[i].vts,
                shutdown: datas[i].shutdown,
                pi: datas[i].pi,
                data_pro: datas[i].data_pro,
                data_link: datas[i].data_link,
                del_id: datas[i]._id
            })
        }
        if (rec == null) {
            console.log('No data Found');
            req.flash('No-Data', '', '/search');
        }
        else {
            console.log(j);
            j--;
            console.log(j);
            console.log(rec[j]);
            res.render('history', {
                examplestatus: rec[j].status,
                exampleusername: rec[j].user_name,
                exampleassettype: rec[j].asset_type,
                examplehostname: rec[j].hostname,
                exampledepart: rec[j].department,
                examplelocation: rec[j].location,
                exampleprotocols: rec[j].protocol,
                exampleModel: rec[j].model,
                exampleModelDescp: rec[j].modelDesp,
                exampleserailNumber: rec[j].serialNumber,
                exampleinstall: rec[j].install_date,
                exampleworkgroup: rec[j].wg,
                exampledomain: rec[j].ad,
                examplevnc: rec[j].vnc,
                examplelync: rec[j].lync,
                examplequiz: rec[j].quiz,
                examplecombolt: rec[j].combolt,
                examplesccm: rec[j].sccm,
                exampleantivirus: rec[j].antiv,
                examplevts: rec[j].vts,
                exampleshutdown: rec[j].shutdown,
                examplepi: rec[j].pi,
                examplepro: rec[j].data_pro,
                exampledatalink: rec[j].data_link
            });
        }
    }
})

app.get('/delete', function (req, res) {
    var i;
    var rec = [];
    for (i = (length - 1); i < length; i++) {
        rec = datas[i];
    }
    if (rec == null) {
        console.log('No Data');
        req.flash('No-Data', '', '/search');
    }
    else {
        console.log(rec.del_id);
        db.collection('Details').deleteOne({ '_id': rec.del_id })
            .then(function (results) {
                req.flash('Delete', '', '/search');
                console.log('Deleted SuccessFully');
            })
    }
})

app.post('/dat', function (req, res) {
    var key = req.body.examplekey;
    console.log(key);
    res.redirect('/search');
})

app.post('/ret', function (req, res) {
    db.collection('Details').find({}).toArray((err, docs) => {
        if (err) throw err
        console.log(docs);
        if (!docs.length) {
            console.log('No data to retrive.')
            req.flash('Retrive-Error', '', '/ret');
        } else {
            fs.writeFile('./js/data.json', JSON.stringify(docs), function (err) {
                if (err) {
                    console.log(err);
                    req.flash('Retrive-Error', '', '/ret');
                } else {
                    console.log('retrieved');
                    req.flash('Retrive-Success', '', '/data');
                }
            });
        }
    })
})

var query_d = [];
var main_data = [];
var query, query_h, query_s;
app.post('/query', function (req, res) {
    query = req.body.examplequery;
    query_h = req.body.query_h;
    query_s = req.body.query_s;
    if (query == null) {
        console.log('Please Select type')
        req.flash('type-Error', '', '/import');
    } else {
        if (query == 'hostname') {
            db.collection('Details').find({ 'Hostname': query_h }).toArray(function (err, docs) {
                if (err) throw err
                if (!docs.length) {
                    res.redirect('/import')
                } else {
                    var i;
                    console.log(docs);
                    for (i = 0; i < docs.length; i++) {
                        query_d.push({
                            status: docs[i].Status,
                            user_name: docs[i].Username,
                            asset_type: docs[i].Asset_Type,
                            hostname: docs[i].Hostname,
                            department: docs[i].Department,
                            location: docs[i].Location,
                            protocol: docs[i].TCP_IP,
                            model: docs[i].Model,
                            modelDesp: docs[i].Model_Desp,
                            serialNumber: docs[i].Serial_Number,
                            install_date: docs[i].Installation_Date,
                            wg: docs[i].WG,
                            ad: docs[i].AD,
                            vnc: docs[i].VNC,
                            lync: docs[i].LYNC,
                            quiz: docs[i].Safety_Quiz,
                            combolt: docs[i].Combolt,
                            sccm: docs[i].SCCM,
                            antiv: docs[i].Anti_Virus,
                            vts: docs[i].VTS,
                            shutdown: docs[i].ShutDown,
                            pi: docs[i].PI,
                            data_pro: docs[i].Data_Pro,
                            data_link: docs[i].Data_Link,
                            del_id: docs[i]._id
                        });
                    }
                    for (i = 0; i < docs.length; i++) {
                        main_data.push({
                            status: docs[i].Status,
                            user_name: docs[i].Username,
                            asset_type: docs[i].Asset_Type,
                            hostname: docs[i].Hostname,
                            department: docs[i].Department,
                            location: docs[i].Location,
                            protocol: docs[i].TCP_IP,
                            model: docs[i].Model,
                            modelDesp: docs[i].Model_Desp,
                            serialNumber: docs[i].Serial_Number,
                            install_date: docs[i].Installation_Date,
                            wg: docs[i].WG,
                            ad: docs[i].AD,
                            vnc: docs[i].VNC,
                            lync: docs[i].LYNC,
                            quiz: docs[i].Safety_Quiz,
                            combolt: docs[i].Combolt,
                            sccm: docs[i].SCCM,
                            antiv: docs[i].Anti_Virus,
                            vts: docs[i].VTS,
                            shutdown: docs[i].ShutDown,
                            pi: docs[i].PI,
                            data_pro: docs[i].Data_Pro,
                            data_link: docs[i].Data_Link
                        });
                      }
                    fs.writeFile('./js/query.json', JSON.stringify(query_d), function (err) {
                        if (err) {
                            console.log(err);
                            req.flash('Retrive-Error', '', '/import');

                        } else {
                            console.log('Exported');
                            req.flash('Retrive-Success', '', '/query_data');
                            query_d = [];
                        }
                    });

                }
            });
        } else {
            console.log('Hello');
            res.redirect('/serial');
        }
    }
})

app.get('/serial', function (req, res) {
    console.log(query_s);
    db.collection('Details').find({ 'Serial_Number': query_s }).toArray(function (err, docs) {
        if (err) throw err
        if (!docs.length) {
            res.redirect('/import')
        } else {
            var i;
            console.log(docs);
            for (i = 0; i < docs.length; i++) {
                query_d.push({
                    status: docs[i].Status,
                    user_name: docs[i].Username,
                    asset_type: docs[i].Asset_Type,
                    hostname: docs[i].Hostname,
                    department: docs[i].Department,
                    location: docs[i].Location,
                    protocol: docs[i].TCP_IP,
                    model: docs[i].Model,
                    modelDesp: docs[i].Model_Desp,
                    serialNumber: docs[i].Serial_Number,
                    install_date: docs[i].Installation_Date,
                    wg: docs[i].WG,
                    ad: docs[i].AD,
                    vnc: docs[i].VNC,
                    lync: docs[i].LYNC,
                    quiz: docs[i].Safety_Quiz,
                    combolt: docs[i].Combolt,
                    sccm: docs[i].SCCM,
                    antiv: docs[i].Anti_Virus,
                    vts: docs[i].VTS,
                    shutdown: docs[i].ShutDown,
                    pi: docs[i].PI,
                    data_pro: docs[i].Data_Pro,
                    data_link: docs[i].Data_Link,
                    del_id: docs[i]._id
                });
            }
            for (i = 0; i < docs.length; i++) {
                main_data.push({
                    status: docs[i].Status,
                    user_name: docs[i].Username,
                    asset_type: docs[i].Asset_Type,
                    hostname: docs[i].Hostname,
                    department: docs[i].Department,
                    location: docs[i].Location,
                    protocol: docs[i].TCP_IP,
                    model: docs[i].Model,
                    modelDesp: docs[i].Model_Desp,
                    serialNumber: docs[i].Serial_Number,
                    install_date: docs[i].Installation_Date,
                    wg: docs[i].WG,
                    ad: docs[i].AD,
                    vnc: docs[i].VNC,
                    lync: docs[i].LYNC,
                    quiz: docs[i].Safety_Quiz,
                    combolt: docs[i].Combolt,
                    sccm: docs[i].SCCM,
                    antiv: docs[i].Anti_Virus,
                    vts: docs[i].VTS,
                    shutdown: docs[i].ShutDown,
                    pi: docs[i].PI,
                    data_pro: docs[i].Data_Pro,
                    data_link: docs[i].Data_Link
                });
              }
            fs.writeFile('./js/query.json', JSON.stringify(query_d), function (err) {
                if (err) {
                    console.log(err);
                    req.flash('Retrive-Error', '', '/import');

                } else {
                    console.log('Exported');
                    req.flash('Retrive-Success', '', '/query_data');
                    query_d = [];
                }
            });

        }
    });
})

var json2csvCallback;

app.get('/export_q', function (req, res) {
  json2csvCallback = function (err, csv) {
    if (err) {
      console.log(err);
      req.flash('Export-Error', '', '/import_cap');;
    } else {

      console.log(csv);
      fs.writeFile('data-query.csv', csv, function (err) {
        if (err) {
          console.log(err);
          req.flash('Export-Error', '', '/import_cap');
        } else {

          console.log('Exported');
          main_data = [];
          req.flash('Export-Success', '', '/');
        }
      });
    }
  };
  converter.json2csv(main_data, json2csvCallback);
})

app.get('/', (req, res) => res.render('index'));
app.get('/form', (req, res) => res.render('form'));
app.get('/search', (req, res) => res.render('search'));
app.get('/search_s', (req, res) => res.render('search_s'));
app.get('/ret', (req, res) => res.render('ret'));
app.get('/data', (req, res) => res.render('data'));
app.get('/import', (req, res) => res.render('import'));
app.get('/query_data', (req, res) => res.render('query_data'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))