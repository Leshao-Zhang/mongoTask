This is a wrapper of mongodb using data.task implemented Functional Programming Style for those who want to implement Functional Programming Style in their code or to get rid of the callback loop of mongodb operation.

Why not use promise?

Promise run immediately once you create it, it is not a good practise when you want a better control of your program's runtime flow.

And also promise is not able to be integrate into libs as it will be run immediately.

@author Leshao Zhang, Sisi Guo

@version 0.2.1

Usage:

const dbUrl='mongodb://localhost:27017/mydb';

const db=require('./data.mongoTask')(dbUrl);

db(collection);							             	//return a Task which opens a collection

db(collection).find(query);     					//return a Task which doing a query, no need to open db first or close db in the end

db(collection).insert(query);   					//return a Task which doing a insert, no need to open db first or close db in the end

db(collection).distinct(key);			   		  //return a Task which doing a distinct, no need to open db first or close db in the end

db(collection)....chain(db.close);			  //return a Task which close the db.

