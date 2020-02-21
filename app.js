//shortcut for saving multiple var declarations in a row
var express 	= require("express"),
	app 		= express(),
	bodyParser 	= require("body-parser"),
	mysql 		= require("mysql"),
	Campground 	= require("./models/campground"),
	Comment 	= require("./models/comment");
	//seedDB = require("./seeds");

var connection = mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: '241813',
	database: 'imagegallary'
});

connection.connect(function(err) {
	if (err) 
  		throw err;
  	console.log("MySQL Database Connected!");
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//seedDB();

app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/style',  express.static(__dirname + '/style'));

app.get('/',function(req,res){
   // res.sendFile('home.ejs',{'root': __dirname + '/templates'});
   	res.render('templates/home');
});

app.get('/showSignInPage',function(req,res){
    //res.sendFile('signin.html',{'root': __dirname + '/templates'});
    res.render('templates/signin');
});

app.get('/showSignInPageretry',function(req,res){
    //res.sendFile('signinretry.html',{'root': __dirname + '/templates'});
    res.render('templates/signinretry');
});
app.get('/showSignUpPage',function(req,res){
  //res.sendFile('signup.html',{'root':__dirname + '/templates'})
  res.render('templates/signup');
});

app.get('/message',function(req,res){
    //res.sendFile('message.html',{'root': __dirname + '/templates'});
    res.render('templates/message');
});

app.get('/loggedin',function(req,res){
    //res.sendFile('loggedin.html',{'root': __dirname + '/templates'});
    res.render('templates/loggedin');
});


app.post('/myaction', function(req, res) {
	console.log('req.body');
	console.log(req.body);
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var date_time = date+' '+time;
	var record = {email: req.body.email, pass: req.body.pass, date_time: date_time};

	//connection.connect();
	connection.query('INSERT INTO user SET ?', record, function(err,res){
	  	if(err) 
	  		console.log("email id already ragistered");
	  	else{
		console.log('Last record insert id:', res.insertId);
		res.redirect('/message');
	}
	});

	
	//connection.end();

	res.end();
});

app.post('/verifyuser', function(req,res){
	console.log('checking user in database');
	console.log(req.body.pass);

	var selectString = 'SELECT COUNT(email) FROM user WHERE email="'+req.body.email+'" AND pass="'+req.body.pass+'" ';
	 
	connection.query(selectString, function(err, results) {
		
        console.log(results);
        var string=JSON.stringify(results);
        console.log(string);
        //this is a walkaround of checking if the email pass combination is 1 or not it will fail if wrong pass is given
        if (string === '[{"COUNT(email)":1}]') {
			res.redirect('/loggedin');
	
	        }
        if (string === '[{"COUNT(email)":0}]')  {
        	res.redirect('/showSignInPageretry');
        	
        }
});

});


app.get("/loggedin/landing", function(req, res){
	res.render("landing");
});
//INDEX - show all campgrounds
app.get("/loggedin/campgrounds", function(req, res){
	//Get all campgrounds from DB
	var p = 'SELECT * FROM images';
	connection.query(p, function(err, allcampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allcampgrounds});
		}
	});
})

//CREATE - create new campgrounds
app.post("/loggedin/campgrounds", function(req, res){
	//get data from form and add to campground array (database later)

	var name = req.body.name; //from campgrounds/new
	var image = req.body.image;
	var description = req.body.description;
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var date_time = date+' '+time;
	var newCampground = {name: name, image: image, description: description, date_time: date_time};

	//Create a new campground and save to DB

	connection.query('INSERT INTO images SET ?',newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			//redirect back to campgrounds page
			res.redirect("/loggedin/campgrounds");
		}
	});

});

//NEW - show form to create new campground
app.get("/loggedin/campgrounds/new", function(req, res){
	res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
app.get("/loggedin/campgrounds/:id", function(req, res){
	//find the campground with provided id 
	var p = 'SELECT id FROM images ORDER BY id DESC LIMIT 1;';
	connection.query(p, function (err, allCampground) {
    	if (err)	
 			console.log(err);
 		else{ 
 			var z = req.params.id;
 			if(z<=allCampground[0].id){
 				//render show template with that campground
 				var q = 'select * from images where id="'+z+'"';
 				connection.query(q, function (err, result) {
    				if (err)	
 						console.log(err);
 					else
 					var name = result[0].name
 					var image = result[0].image
 					var description = result[0].description
 					var date_time = result[0].date_time
					res.render("campgrounds/show", {name: name, image: image, description: description, date_time: date_time});
				});

			}
 			else
 				console.log("error");
 		}	
	});	
});


/*
//SHOW - shows more info about one campground
//Resource on using .populate() and .exec(): http://mongoosejs.com/docs/populate.html
app.get("/campgrounds/:id", function(req, res){
	//find campground with provided ID
	//connection.query('SELECT * FROM images where id = ?;',(req.params.id), function(err, foundCampground){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			//render show template with that campground
			res.render("campgrounds/show", {camp: foundCampground});
		}
	});
});


// ==================
// COMMENTS ROUTES
// ==================

//NEW ROUTE
app.get("/campgrounds/:id/comments/new", function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {camp: campground});
		}
	});
});


//POST ROUTE
app.post("/campgrounds/:id/comments", function(req, res){
	//lookup campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			//create new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {
					//connect new comment to campground
					campground.comments.push(comment);
					campground.save();
					//redirect to Campground SHOW page
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

*/
app.listen("3000", function(){
	console.log("YelpCamp running on port 3000");
});



