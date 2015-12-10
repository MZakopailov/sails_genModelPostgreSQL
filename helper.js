//
//  helper.js
//  GetMeModelBro
//
//  Created by MAXIM ZAKOPAYLOV on 04.12.15.
//  Copyright (c) 2015 Maxim Zakopaylov and Aleksey Rogov.
//  All rights reserved.
//


module.exports = {
  checkType: function(type){
    switch (type) {
      case 'real':
        return 'FLOAT';
        break;
      case 'character varying':
          return 'STRING';
          break;
      case 'bigint':
        return 'INTEGER';
        break;
      case 'timestamp without time zone':
        return 'STRING';
        break;
      default:
        return type;
        break;
    }
  },

  checkArgInput: function(argv){
    if (argv.USERNAME == undefined) {
    	console.log("ERROR: --USERNAME=<username>")
    	process.exit(1);
    }
    if (argv.PASSWORD == undefined) {
    	console.log("ERROR: --PASSWORD=<password>")
    	process.exit(1);
    }
    if (argv.HOST == undefined) {
    	console.log("ERROR: --HOST=<ip host>")
    	process.exit(1);
    }
    if (argv.DBNAME == undefined){
    	console.log("ERROR: --TABLEBANAME=<table name>")
    	process.exit(1);
    }
    if (argv.SCHEMA == undefined){
    	console.log("ERROR: --SCHEMA=<chema name>")
    	process.exit(1);
    }
    if (argv.DIR == undefined){
    	console.log("ERROR: --DIR=<directory models>")
    	process.exit(1);
    }
  },

  capitalizeFirstLetter: function(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

}
