var ajax_path = "comm-pg.php";
var ajax_out  = "";
var jspgOption = {
	output_type : "json",
	asynchronous : true,
	max_records : 2000000
}

function jspgQuery(pg_query)
{
    console.log("jspgQuery started.");
    new Ajax.Request( ajax_path,    {
        method:         'get',
        asynchronous:   jspgOption['asynchronous'],
        parameters: { pgsql: pg_query },
        onSuccess:  function(transport) {
            if (jspgOption["output_type"] == "json") {
                console.log("transport.responseText: "+transport.responseText);
                ajax_out = transport.responseText.evalJSON();
                console.log("evalJSON complete");
                manageNewTX(ajax_out);
            }
            else if (jspgOption["output_type"] == "text") {
                ajax_out = transport.responseText;
            }
        }
    });
}

function jspgSetOption(key, val) {
	jspgOption[key] = val;
}

function jspgGetOption( key ){
    if (jspgOption[key])
        return(jspgOption[key]);
    else
        return(false);
}