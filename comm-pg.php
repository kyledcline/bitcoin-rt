<?php

$host = "localhost";
$user = "postgres";
$pass = "";
$db   = "cddb";

$con = pg_connect("host=$host dbname=$db user=$user password=$pass");
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
