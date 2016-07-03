<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

/**
 * Step 2: Instantiate a Slim application
 *
 * This example instantiates a Slim application using
 * its default settings. However, you will usually configure
 * your Slim application now by passing an associative array
 * of setting names and values into the application constructor.
 */
$app = new \Slim\Slim();

/**
 * Step 3: Define the Slim application routes
 *
 * Here we define several Slim application routes that respond
 * to appropriate HTTP request methods. In this example, the second
 * argument for `Slim::get`, `Slim::post`, `Slim::put`, `Slim::patch`, and `Slim::delete`
 * is an anonymous function.
 */

// GET route
$app->get(
    '/featured',
    function () {
    $sql = "select * FROM dawg2_featured order by date_created desc limit 0, 5";
        try {
            $db = getPDOConnection();
            $stmt = $db->query($sql);
            $events = $stmt->fetchAll(PDO::FETCH_OBJ);
            $db = null;
            echo '{"events": ' . json_encode($events,/*JSON_PRETTY_PRINT*/ 128) . '}';
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
);

$app->get(
    '/getFeatured',
    function () {

        $sql = "select * FROM dawg2_featured order by date_created desc limit 0, 5";

        try {
            $conn = getConnection();

            $result = mysqli_query($conn,$sql);
            $events = mysqli_fetch_assoc($result);
            
            echo '{"events": ' . json_encode($events,/*JSON_PRETTY_PRINT*/ 128) . '}';

            closeConnection($conn);

        } catch(Exception $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
);

$app->get("/test/:x",

    function ($x) {

        echo '{"result":' . $x . '}';
    }
);

//$app->get("/test2",

$app->get('/test2',  
    function () use ($app) {

        $a = $app->request()->get('a');
        $b = $app->request()->get('b');

        echo '{"result":{"a":' . $a . ',"b":' . $b . '}}';
    }
);


// POST route
$app->post(
    '/post',
    function () use ($app) {

        //$body = $app->request->getBody();        

        //$request = \Slim\Slim::getInstance()->request();

        //$name = $request->post('name');
        //$name = "test";

        $name = $app->request->params('name');

        $d = json_decode($app->request->getBody());

        echo 'This is a POST route: name = ' . $d->name;

/*
$request = Slim::getInstance()->request();
    $wine = json_decode($request->getBody());
    $sql = "INSERT INTO wine (name, grapes, country, region, year, description) VALUES (:name, :grapes, :country, :region, :year, :description)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("name", $wine->name);
        $stmt->bindParam("grapes", $wine->grapes);
        $stmt->bindParam("country", $wine->country);
        $stmt->bindParam("region", $wine->region);
        $stmt->bindParam("year", $wine->year);
        $stmt->bindParam("description", $wine->description);
        $stmt->execute();
        $wine->id = $db->lastInsertId();
        $db = null;
        echo json_encode($wine);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
   
    }
*/  

});
    
/*
function promotedEventExists($eid)
{
    $sql = "select * FROM dawg2_promoted_event where eid = " . $eid;
    
    try {
        $db = getPDOConnection();
        
        $stmt = $db->query($sql);
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return count($res);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';

    }
    
  return false;
}
*/

function featuredEventExists($eid)
{
    $sql = "select * FROM dawg2_promoted_event where eid = " . $eid;

    $res = false;
    
    try {
        $conn = getConnection();

        if ($result = $conn->query($sql)) {

            if ($result->num_rows > 0)
                $res = true;

            $result->close();
        }

        closeConnection($conn);

    } catch(Exception $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';

    }

    return $res;
}

function pdo_insert_array($table_name, $data)
{
    $fields = "";
    $bindings = "";
    $i = 0;
    
    //$len = count($data);
    $len = 0;
    
    foreach ($data as $k => $v) {
      $len++;
      //echo "$k => $v.\n";
     }
  
    foreach ($data as $k => $v) {
    
        $fields .= $k;
        $bindings .= ":" . $k;
        
        if ($i < $len-1)
        {
          $fields .= ",";
          $bindings .= ",";
        }
        
        $i++;
    }
    
    $sql = "INSERT INTO " . $table_name . " (" . $fields . ") VALUES (" . $bindings . ")";
    
    try {
     
        $db = getPDOConnection();
            
        $stmt = $db->prepare($sql);

        $i = 1;
        
        foreach ($data as $k => $v) {
          $stmt->bindParam($i++, $v);
        }
            
        $stmt->execute();
        //echo json_encode($wine);
        return $db->lastInsertId();
        $db = null;
        //return $sql;
    } catch(PDOException $e) {
      return $e->getMessage();
        //echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function mysql_insert_array($table, $data, $exclude = array()) {

    $conn = getConnection();

    $fields = $values = array();

    if( !is_array($exclude) ) $exclude = array($exclude);

    foreach( array_keys($data) as $key ) 
    {
        if( !in_array($key, $exclude) ) 
        {
            $fields[] = "`$key`";
            $values[] = "'" . $conn->real_escape_string($data[$key]) . "'";
        }
    }

    $fields = implode(",", $fields);
    $values = implode(",", $values);

    if ( $conn->query("INSERT INTO `$table` ($fields) VALUES ($values)") ) 
    {
        $res = array( "mysql_error" => false,
                      "mysql_insert_id" => mysqli_insert_id($conn),
                      "mysql_affected_rows" => mysqli_affected_rows($conn),
                      "mysql_info" => mysqli_info($conn)
                    );

         closeConnection($conn);   

         return $res;
    } else {
        $res = array( "mysql_error" => mysql_error() );

        closeConnection($conn);

        return $res;
    }
}

$app->post(
    '/addFeaturedEvent',
    function () use ($app) {
    
        $d = json_decode($app->request->getBody(), true);

        //date_default_timezone_set('Australia/Sydney');
        $dt = date('Y-m-d H:i:s');
        $d["date_created"] = $dt;
      
        //$d->description = htmlspecialchars($d->description, TRUE);

        $res = array("status" => 0, "text" => "event aleady featured");
  
        if ( !featuredEventExists($d["eid"]) )
        {
            $r = mysql_insert_array("featured", $d);

            $res["text"] = $r["mysql_error"];

            if ($r["mysql_error"] == false)
                $res["status"] = 1;
            else
                $res["status"] = 0;
        }

        echo json_encode($res);
    }
);


// PUT route
$app->put(
    '/put',
    function () {
        echo 'This is a PUT route';
    }
);

// PATCH route
$app->patch('/patch', function () {
    echo 'This is a PATCH route';
});

// DELETE route
$app->delete(
    '/delete',
    function () {
        echo 'This is a DELETE route';
    }
);

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();

function getConnection()
{
    $dbhost="127.0.0.1";
    $dbuser="root";
    $dbpass="admin123";
    $dbname="eventdb3";

    $conn = mysqli_connect($dbhost,$dbuser,$dbpass,$dbname);

    /* check connection */

    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
        //exit();
        return null;
    }    

    if (!$conn->set_charset("utf8")) {
        printf("Error loading character set utf8: %s\n", $conn->error);
    } else {
        //printf("Current character set: %s\n", $conn->character_set_name());
        ;
    }

    return $conn;  
}

function closeConnection($conn)
{
    mysqli_close($conn);
}

function getPDOConnection() {
    //$dbhost="127.0.0.1";
    //$dbuser="root";
    //$dbpass="admin123";
    //$dbname="eventdb3";
    
    $dbhost = 'internal-db.s116139.gridserver.com';
    $dbuser = 'db116139_c1ber';
    $dbpass = 'freak1ngdeak1ng';
    $dbname = 'db116139_dawg';

    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname;charset=utf8", $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}


?>