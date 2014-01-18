<?php

$host = $_ENV["DB_HOST"];
$user = $_ENV["DB_USER"];
$pass = $_ENV["DB_PASS"];
$db   = $_ENV["DB_DB"];

$conn = pg_connect("host=$host port=5492 dbname=$db user=$user password=$pass sslmode=require") or die("Error connecting to database.");

$json = "";

if (isset($_GET['pgsql'])) {

	$pg_query = $_GET['pgsql'];
	$result = pg_prepare($conn, "loc_query", 'SELECT l.* FROM blocks b JOIN locations2 l ON (b.locid = l.locid) WHERE $1 BETWEEN b.startip AND b.endip LIMIT 1');
	$result = pg_execute($conn, "loc_query", array($pg_query));


	if ($result != false and @pg_num_rows($result) > 0) {
		$row = pg_fetch_assoc($result);
		$json = json_encode($row);
	}
}

echo ($json);

?>