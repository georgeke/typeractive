<!DOCTYPE html>

<html>
<head>
	<meta charset="UTF-8">
	<title>Typeractive</title>
	<script src="scraper.js"></script>
	<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
</head>	

<?php 

include 'db.php';
include 'config.php';

$db = new DB($config);

?>

<body>

<article>
	<form>
		Page: <input type="text" id="urlForm"></input>
	</form>
	<button value="Go" onclick="Scraper.parsePage()"><p>Enter</p></button>
	<p id="output"></p>
	<p id="msg"></p>
</article>

</body>

</html>
