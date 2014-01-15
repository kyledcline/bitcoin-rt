<?php

$host = $_ENV["DB_HOST"];
$user = $_ENV["DB_USER"];
$pass = $_ENV["DB_PASS"];
$db   = $_ENV["DB_DB"];

$con = pg_connect("host=$host port=5492 dbname=$db user=$user password=$pass sslmode=require") or die("Could not connect. Error: $php_errormsg");
$json = "";

if (isset($_GET['pgsql'])) {
	$pg_query = rawurldecode($_GET['pgsql']);
	$rs = pg_query($con, stripslashes($pg_query));
	if ($rs != false and @pg_num_rows($rs) > 0) {
		$pg_num_rows = pg_num_rows($rs);
		for ($i = 0; $i < $pg_num_rows; $i++) {
			$row = pg_fetch_assoc($rs);
			$json = "{";
			foreach ($row as $res_key => $res_val) {
				$json .= "\"".$res_key."\": \"".utf8_encode($res_val)."\",";
			}
			$json = substr($json, 0, -1);
			$json .= "}";
			// I think this line is the offender - delete and push - let's see what happens?!
			echo (	$json);
			if ($i < $pg_num_rows - 1) {
				$json .= ", ";
			}
		}
	}
	echo ($json);
}
else {
	echo ($php_errormsg);	
}

?>