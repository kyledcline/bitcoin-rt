<?php

$host = "ec2-184-73-177-15.compute-1.amazonaws.com";
$user = "u6v8meri9ef421";
$pass = "p8v5s7ep53mj3jmkt7qh9pt4o5";
$db   = "d1im0og2qg9u0n";

$con = pg_connect("host=$host port=5492 dbname=$db user=$user password=$pass sslmode=require");
$json = "";

#$rs = pg_query($con, $query) or die("Cannot execute query: $query\n");

if (isset($_GET['pgsql'])) {
	$pg_query = rawurldecode($_GET['pgsql']);
	$rs = pg_query($con, stripslashes($pg_query));
	if ($rs != false and @pg_num_rows($rs) > 0) {
		$pg_num_rows = pg_num_rows($rs);
		#json .= "[";
		for ($i = 0; $i < $pg_num_rows; $i++) {
			$row = pg_fetch_assoc($rs);
			$json = "{";
			foreach ($row as $res_key => $res_val) {
				$json .= "\"".$res_key."\": \"".utf8_encode($res_val)."\",";
			}
			$json = substr($json, 0, -1);
			$json .= "}";
			if ($i < $pg_num_rows - 1) {
				$json .= ", ";
			}
		}
		#$json .= "]";	
	}
	echo ($json);
}

?>