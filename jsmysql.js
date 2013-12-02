var ajax_path = "comm.php";
var ajax_out  = "";
var jsmysqlOption = {
	output_type : "text",
	asynchronous : true,
	max_records : 2000000
}

function jsmysqlQuery(mysql_query)
{
    new Ajax.Request( ajax_path,    {
        method:         'get',
        asynchronous:   jsmysqlOption['asynchronous'],
        parameters: {
            mr: jsmysqlOption['max_records'],
            mysql: mysql_query },
        requestHeaders: { Accept: 'application/json' },
        onSuccess:  function( transport ){
            if (jsmysqlOption["output_type"] == "json")
                ajax_out = transport.responseText.evalJSON(true);
            else if (jsmysqlOption["output_type"] == "text")
                ajax_out = transport.responseText;
            return(ajax_out);
        }
    });
    return(ajax_out);
}

function jsmysqlSetOption(key, val) {
	jsmysqlOption[key] = val;
}

function jsmysqlGetOption( key ){
    if (jsmysqlOption[key])
        return(jsmysqlOption[key]);
    else
        return(false);
}