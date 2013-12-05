<?php include_once("index.html"); 

#### DELETE EVERYTHING BELOW AFTER DEBUG

# This function reads your DATABASE_URL configuration automatically set by Heroku
# the return value is a string that will work with pg_connect
function pg_connection_string() {
	return "dbname=d1im0og2qg9u0n host=ec2-184-73-177-15.compute-1.amazonaws.com port=5492 user=u6v8meri9ef421 password=p8v5s7ep53mj3jmkt7qh9pt
4o5 sslmode=require";
}
 
# Establish db connection
$db = pg_connect(pg_connection_string());
echo "Attempted pg connect.";
if (!$db) {
   echo "Database connection error.";
   exit;
}
 
echo "Attempting query.";
$result = pg_query($db, "SELECT l.* FROM blocks b JOIN locations l ON (b.locId = l.locId) WHERE 1535522132 BETWEEN b.startIp AND b.endIp LIMIT 1;") or die("Could not execute query.");

?>