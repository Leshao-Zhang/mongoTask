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
 * @version 0.2.1
 * Usage:
 * const dbUrl='mongodb://localhost:27017/mydb';
 * const db=require('./data.mongoTask')(dbUrl);
 * db(collection);									//return a Task which opens a collection
 * db(collection).find(query);     					//return a Task which doing a query, no need to open db first or close db in the end
 * db(collection).insert(query);   					//return a Task which doing a insert, no need to open db first or close db in the end
 * db(collection).distinct(key);					//return a Task which doing a distinct, no need to open db first or close db in the end
 * db(collection)....chain(db.close);				//return a Task which close the db.
 */

'use strict';
const mongo=require('mongodb').MongoClient;
const task=require('data.task');

/**
 * Return the operations to the giving database 
 * @param {String} url 
 * @summary Function :: String -> Object
 */
module.exports=(url)=>{
	let database=null;

	/**
	 * Return a Task open the giving collection in the database
	 * @param {String} collection 
	 * @summary Function :: String -> Task
	 */
	let DB=(collection)=>{
		let ret={};
		let col=new task((reject,result)=>{
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

		ret.map=col.map;
		ret.chain=col.chain;
		/**
		 * Return a Task close the opened database
		 * @param {*} res 
		 * @summary close :: a -> Task(a)
		 */

		/**
		 * Return the result giving the query
		 * @param {Object} query
		 * @summary find :: Object -> Object -> Object
		 */
		ret.find=(query)=>{
			return col.map((col)=>{
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
			.chain(DB.close)
		};

		/**
		 * Return the result giving the key
		 * @param {String} key 
		 * @summary distinct :: String -> Object -> Object
		 */
		ret.distinct=(key)=>{
			return col.chain((col)=>{
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
			.chain(DB.close)
		};

		/**
		 * Return the result of insert a json
		 * @param {JSON} json 
		 * @summary insert :: Object -> Object -> Object
		 */
		ret.insert=(json)=>{
			return col.chain((col)=>{
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
			.chain(DB.close)
		};

		return ret;
	};

	DB.close=(res)=>{
		return new task((reject,result)=>{
			if(database){
				database.close();
			}
			result(res);
		})
	};

	return DB;
};
