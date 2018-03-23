var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:'SuperSecretPassword'}));
app.use(express.static('public'));

var openWMCreds = require('./creds.js');
var openWMURL = "http://api.openweathermap.org/data/2.5/weather?q=";

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6703);

app.get('/',function(req,res,next){
  var context = {};
  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newUser', context);
    return;
  }
  context.user = req.session.name;
  context.toDoItemCount = req.session.toDoItems.length || 0;
  context.toDoItems = req.session.toDoItems || [];
  //console.log(context.toDo);
  if(context.toDoItemCount === 1){
	res.render('toDoListSingular',context);
  }
  else{
	res.render('toDoList', context);
  }
});

app.post('/toDoList',function(req,res,next){
	var context = {};
  
	if(req.body.newList){
	req.session.name = req.body.user;
	req.session.toDoItems = [];
	req.session.curId = 0;
  }

  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newUser', context);
    return;
  }

  if(req.body.itemToAdd){
	//console.log(req.body.minTemp);
    req.session.toDoItems.push({"ItemName":req.body.itemToAdd, "id":req.session.curId, 
									"city": req.body.cityDesignation, "Minimum Temp":
									Number(req.body.minTemp)});
    req.session.curId++;
	//console.log(openWMURL+req.session.toDoItems[req.session.toDoItems.length - 1].city
	//	+openWMCreds.openWMKey+'&units=imperial');
	request(openWMURL+req.session.toDoItems[req.session.toDoItems.length - 1].city
		+openWMCreds.openWMKey+'&units=imperial', function(err, response, body){
	  if(!err & response.statusCode < 400){
		  //console.log(JSON.parse(body).main.temp);
		  req.session.toDoItems[req.session.toDoItems.length - 1].temp = Number(JSON.parse(body).main.temp);
		  if(req.session.toDoItems[req.session.toDoItems.length - 1].temp >= 
			 req.session.toDoItems[req.session.toDoItems.length - 1]["Minimum Temp"]){
				req.session.toDoItems[req.session.toDoItems.length - 1].atMinTemp = true;
			 }
		  else{
			  req.session.toDoItems[req.session.toDoItems.length - 1].atMinTemp = false;
		     }
			 console.log(req.session.toDoItems[req.session.toDoItems.length - 1].atMinTemp);
		  request({"url":"http://httpbin.org/post",
				   "method":"POST",
				   "headers":{
					   "Content-Type":"application/json"
					},
				   "body": JSON.stringify(req.body.externalPostRequestContent)
					}, function(err, response, body){
						if(!err && response.statusCode < 400){
							context.externalPostRequest = JSON.parse(body).json;
							//console.log(req.body.externalPostRequestContent);
							//console.log(context.externalPostRequest);
							context.user = req.session.name;
						    context.toDoItemCount = req.session.toDoItems.length;
						    context.toDoItems = req.session.toDoItems;
						    //console.log(context.toDoItems);
						    //var city = req.body.cityDesignation;
							if(context.toDoItemCount === 1){
								console.log('yippie!');
								res.render('toDoListSingular',context);
								return;
							}
							else{
								console.log('yippie!!');
								res.render('toDoList', context);
								return;
							}
						}
						else{
							console.log(err);
							if(response){
								console.log(response.statusCode)
							}
						next(err);
						}
					});
			}
		  else{
			  if(response){
				  console.log(response.statusCode);
			  }
		  next(err);
		  }  
		});
    }
  else{	
	  if(req.body.done){
		req.session.toDoItems = req.session.toDoItems.filter(function(e){
		  //console.log(e.atMinTemp, e.id, Number(req.body.id));
		  //console.log(e.atMinTemp === true && e.id === Number(req.body.id) ? false : true);
		  return e.atMinTemp === true && e.id === Number(req.body.id) ? false : true;
		});
		  context.user = req.session.name;
		  context.toDoItemCount = req.session.toDoItems.length;
		  context.toDoItems = req.session.toDoItems;
		  //console.log(context.toDoItems);
		  if(context.toDoItemCount === 1){
			res.render('toDoListSingular',context);
			return
			}
		  else{
			res.render('toDoList', context);
			return;
		}
	  }
	  context.user = req.session.name;
	  context.toDoItemCount = req.session.toDoItems.length;
	  context.toDoItems = req.session.toDoItems;
	  //console.log(context.toDoItems);
	  if(context.toDoItemCount === 1){
		res.render('toDoListSingular',context);
		}
	  else{
			res.render('toDoList', context);
		}
    }
 });


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on server-side-http-requests.heroku.com:' + app.get('port') + '; press Ctrl-C to terminate.');
});
