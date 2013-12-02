<?php

$mysql_host     = "localhost";
$mysql_username = "root";
$mysql_password = "";
$mysql_database = "cddb";

$mysql_db = mysql_connect($mysql_host, $mysql_username, $mysql_password);
$mysql    = mysql_select_db($mysql_database);
$json     = "";

if(isset($_GET['mysql'])){
    $mysql_query    = rawurldecode($_GET['mysql']);
    $mysql          = mysql_query( stripslashes($st = $mysql_query) );
    if($mysql != false and  @mysql_num_rows($mysql) > 0){
        $mysql_num_rows = mysql_num_rows($mysql);
        #$json .= "[";
        for($i = 0; $i < $mysql_num_rows; $i++){
            $res_row = mysql_fetch_assoc($mysql);
            $json .= "{";
            foreach($res_row as $res_key => $res_value){
                $json .= "\"".$res_key."\": \"".utf8_encode($res_value)."\",";
            }
            $json = substr($json, 0, -1);
            $json .= "}";
            if($i < $mysql_num_rows - 1){
                $json .= ", ";
            }#end if
        }#end for
        #$json .= "]";
    }
    else{
        $json .= "{";
        $json .= "\"error\": \"".addslashes(mysql_error())."\", ";
        $json .= "\"errno\": \"".addslashes(mysql_errno())."\"  ";
        $json .= "}";
    }
    echo($json);
}
?> 