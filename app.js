//
//  app.js
//
//
//  Created by MAXIM ZAKOPAYLOV on 04.12.15.
//  Copyright (c) 2015 Maxim Zakopaylov and Aleksey Rogov.
//  All rights reserved.
//

var http = require('http');
var pg = require('pg');
var argv = require('minimist')(process.argv.slice(2));
var helper = require('./helper');
var fs = require('fs');
var async = require('async');

helper.checkArgInput(argv);

var dirModel = argv.DIR;
if (!fs.existsSync(dirModel)){
    fs.mkdirSync(dirModel);
}

var conString = "postgres://"+argv.USERNAME+":"+argv.PASSWORD+"@"+argv.HOST+"/"+argv.DBNAME;

pg.connect(conString, function(err, client, done) {
	if (err) {
		console.log("Error pg client:" + err);
		process.exit(1);
	}
	client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='"+argv.SCHEMA+"'", function(err, result){
		if (err){
			console.log("Error pg client:" + err);
			process.exit(1);
		}
		async.eachSeries(result.rows, function iterator(item, callback) {
				compliteMode(client, item.table_name, argv.SCHEMA, callback);
			}, function done() {
			  process.exit(1);
			});
	});
});

//Get row name in table
function compliteMode(pgClient, tablename, shema, callback){
	var resultJson = {
		autoCreatedAt: false,
		autoUpdatedAt: false,
		tableName: ""+tablename+"",
		connection: 'somePostgresqlServer',
		migrate: 'safe',
		attributes: {}
	};
	pgClient.query("SELECT * FROM information_schema.columns WHERE table_schema = '"+shema+"' AND table_name = '"+tablename+"'", function(err, result) {
		var attributes = {};
		var arrayResult = result.rows;
		for (var i in arrayResult){
			var row = result.rows[i];
			attributes[row.column_name] = {};
			attributes[row.column_name].type = helper.checkType(row.data_type).toUpperCase();
		}
		complitePrimaryKey(pgClient, tablename, attributes, function(attr){
			compliteForeignKey(pgClient, tablename, attr, function(resultAttr){
				resultJson.attributes = resultAttr;
				fs.writeFile(dirModel +'/'+helper.capitalizeFirstLetter(tablename+'.js'),'module.exports = \n'+ JSON.stringify(resultJson,null,4) +';', function(err){
					if (err) {
						console.log("Error make file! " + err);
						process.exit(1);
					}
					console.log(tablename + " Compited!");
					callback();
				});
			});
		});
	});
}

function complitePrimaryKey(pgClient, tableName, attributes, callback){
	pgClient.query("SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = '"+tableName+"'::regclass AND i.indisprimary", function(err, result) {
		if (result){
			for (var i in result.rows){
				attributes[result.rows[i].attname].primaryKey = true
			}
		}
		callback(attributes);
	});
}

function compliteForeignKey(pgClient, tableName, attributes, callback){
	pgClient.query("SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name='"+tableName+"'", function(err, result) {
		for (var i in result.rows){
		 	attributes[result.rows[i].column_name].model = helper.capitalizeFirstLetter(result.rows[i].foreign_table_name)
			attributes[result.rows[i].column_name].columnName = result.rows[i].column_name
		}
		callback(attributes);
	});
}
