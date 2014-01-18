var ajax_path = "comm.php";
var ajax_out  = "";
var jspgOption = {
	output_type : "json",
	asynchronous : true,
	max_records : 2000000
}

function jspgQuery(ipAddInt, wsData)
{
    new Ajax.Request( ajax_path,    {
        method:         'get',
        asynchronous:   jspgOption['asynchronous'],
        parameters: { pgsql: ipAddInt },
        onSuccess:  function(transport) {
            if ((jspgOption["output_type"] == "json") && (transport.responseText.length > 0)) {
                ajax_out = transport.responseText;
                console.log('ajax_out:'+ajax_out);
                ajax_out = ajax_out.evalJSON();
                manageNewTX(ajax_out, wsData);
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
