<!DOCTYPE html>

<html>
<head>
	<meta charset="UTF-8">
	<title>Typeractive</title>
	<script src="scraper.js"></script>
	<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
</head>

<?php

try {
	$client = new MongoClient();
	$db = $client->selectDB('type_db');
} catch ( MongoConnectionException $e ) {
	echo '<p>Couldn\'t connect to mongodb, is the "mongo" process running?</p>';
	exit();
}

?>	

<body>

<article>
	<form>
		Page: <input type="text" id="urlForm"></input>
	</form>
	<button value="Go" onclick="Scraper.parsePage()"><p>Enter</p></button>
	<p id="output"></p>
</article>

</body>

</html>
