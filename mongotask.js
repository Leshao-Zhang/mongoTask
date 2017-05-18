/**
 * This is a wrapper of mongodb using data.task implemented 
 * Functional Programming Style for those who want to
 * implement Functional Programming Style in their code or
 * to get rid of the callback loop of mongodb operation.
 * Why not use promise?
 * Promise run immediately once you create it, it is not a good practise
 * when you want a better control of your program's runtime flow.
 * And also promise is not able to be integrate into libs as it will be 
 * run immediately
 * @author Leshao Zhang, Sisi Guo
 * @version 0.1.1
 * Usage:
 * var db=require('./mongotask');
 * var dbUrl='mongodb://localhost:27017/mydb';
 * db(dbUrl).open(collection);					//return a Task which opens a collection
 * db(dbUrl).find(query).from(collection);      //return a Task which doing a query, no need to open db first or close db in the end
 * db(dbUrl).insert(query).to(collection);      //return a Task which doing a insert, no need to open db first or close db in the end
 * db(dbUrl).distinct(key).from(collection);	//return a Task which doing a distinct, no need to open db first or close db in the end
 * db(dbUrl)....chian(db.close);				//return a Task which close the db.
 */

'use strict';
var mongo=require('mongodb').MongoClient;
var task=require('data.task');

/**
 * Return the operations to the giving database 
 * @param {String} url 
 * @summary db :: String -> Object
 */
var db=(url)=>{
	var database=null;

	/**
	 * Return a Task open the giving collection in the database
	 * @param {String} collection 
	 * @summary open :: String -> Task
	 */
	var open=(collection)=>{
			return new task((reject,result)=>{
				mongo.connect(url,(err,db)=>{
					if(err){
						reject(err);
					}else{
						database=db;
						result(db);
					}
				})
			})
			.map((db)=>{
				return db.collection(collection);
			});
		};

	/**
	 * Return a Task close the opened database
	 * @param {*} res 
	 * @summary close :: a -> Task(a)
	 */
	var close=(res)=>{
			return new task((reject,result)=>{
				if(database){
					database.close();
				}
				result(res);
			})
		};

	/**
	 * Return the result giving the query
	 * @param {Object} query
	 * @summary find :: Object -> Object -> Object
	 */
	var find=(query)=>{
			return {'from':(collection)=>
						open(collection)
						.map((col)=>{
							return col.find(query); 
						})
						.chain((doc)=>{
							return new task((reject,result)=>{
								doc.toArray((err,doc)=>{
									if(err){
										reject(err);
									}
									if(doc){
										result(doc);
									}
								})
							})
						})
						.chain(close)
			}
		};

	/**
	 * Return the result giving the key
	 * @param {String} key 
	 * @summary distinct :: String -> Object -> Object
	 */
	var distinct=(key)=>{
		return {'from':(collection)=>
					open(collection)
					.chain((col)=>{
						return new task((reject,result)=>{
							col.distinct(key,(err,doc)=>{
								if(err){
									reject(err);
								}
								if(doc){
									result(doc);
								}
							})
						})
					})
					.chain(close)
		}
	}

	/**
	 * Return the result of insert a json
	 * @param {Object} json 
	 * @summary insert :: Object -> Object -> Object
	 */
	var insert=(json)=>{
		return {"to":(collection)=>
					open(collection)
					.chain((col)=>{
						return new task((reject,result)=>{
							col.insert(json,(err,res)=>{
								if(err){
									reject(err);
								}
								if(res){
									result(res);
								}
							})
						})
					})
					.chain(close)
		}
	}

	/**
	 * return the sub functions
	 */
	return {
		"open":open,
		"find":find,
		"close":close,
		"insert":insert,
		"distinct":distinct
	};
};

/**
 * @module mongotask
 */
module.exports=db;
