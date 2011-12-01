<?

//---Start Session---//
session_start();


//---Verification---//
if(!array_key_exists("flag", $_REQUEST))	{
	exit;
}


//---Check Establish Connection---//
$response = NULL;

if($_REQUEST["flag"] == "establish_connection")	{
	//---Extract Params---//
	$params = json_decode(stripslashes($_REQUEST["params"]), true);
	
	$hostname_ip = $params["hostname_ip"];
	$port = $params["port"];
	$username = $params["username"];
	$password = $params["password"];
	
	
	//---Attempt Connection---//
	$connect_function = "mysql_connect";
	$connect_function_params = array($hostname_ip . ":" . $port, $username, $password);
	
	$connection = @call_user_func_array($connect_function, $connect_function_params);
	if($connection === false)	{
		display_response(false, "There was an error when establishing a connection. Automated error: " . mysql_error());
	}
	else	{
		//---Store Connection Information---//
		if(!array_key_exists("connections", $_SESSION))	{
			$_SESSION["connections"] = array();
		}
		
		$connection_id = count($_SESSION["connections"]) + 1;
		
		$_SESSION["connections"][$connection_id] = array(
			"connect_function"=>$connect_function,
			"connect_function_params"=>$connect_function_params
		);
	
		display_response(true, $connection_id);
	}
}


//---Establish Connection---//
if(!array_key_exists("connection_id", $_REQUEST))	{
	exit;
}

$connection_information = $_SESSION["connections"][$_REQUEST["connection_id"]];
$connection = @call_user_func_array("call_user_func_array", $connection_information);
if(!$connection)	{
	display_response(false, "There was an error when establishing a connection. Automated error: " . mysql_error());
}


//---Check Flag---//
$response = null;

switch($_REQUEST["flag"])	{
	case "load_databases":
		$return_array = array();
	
		$records = run_query_and_get_records($connection, "SHOW DATABASES");
		foreach($records as $record)	{
			$database_name = $record["Database"];
		
			$return_array[] = array(
				"id"=>$database_name,
				"connectionId"=>$_REQUEST["connection_id"],
				"type"=>"database",
				"text"=>$database_name,
				"iconCls"=>"icon-proxy-mysql-php-database"
			);
		}
		
		$response = $return_array;
		break;
	case "load_tables":
		$return_array = array();
		
		$records = run_query_and_get_records($connection, "SHOW TABLES FROM " . $_REQUEST["node_id"]);
		foreach($records as $record)	{
			$table_name = $record["Tables_in_" . $_REQUEST["node_id"]];
			
			$return_array[] = array(
				"id"=>md5($_REQUEST["node_id"]) . "|" . $table_name,
				"connectionId"=>$_REQUEST["connection_id"],
				"type"=>"table",
				"text"=>$table_name,
				"iconCls"=>"icon-proxy-mysql-php-table",
				"leaf"=>true,
				"database"=>$_REQUEST["node_id"]
			);
		}
	
		$response = $return_array;
		break;
}

display_response(true, $response);


//---Functions---//
function display_response($in_success, $in_message)	{
	echo json_encode(array("type"=>($in_success ? "success" : "error"), "message"=>$in_message));
	exit;
}

function run_query_and_get_records(&$in_connection, $in_query, $in_start=0, $in_limit=0)	{
	//---Get Results---//
	$results = mysql_query($in_query, $in_connection);
	if($results === false)	{
		display_response(false, "Unable to process query at this time. Automated error: " . mysql_error());
	}
	
	
	//---Data Seek---//
	if($in_start)	{
		mysql_data_seek($results, $in_start);
	}


	//---Generate Return Array---//
	$return_array = array();
	$count = 0;
	
	while($record = mysql_fetch_assoc($results))	{
		$return_array[] = $record;
		
		$count++;
		if($count == $in_limit)	{
			break;
		}
	}
	
	return $return_array;
	
}