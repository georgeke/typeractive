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

// CREATING
/*
$paragraph = array(
	'type' => 'paragraph',
	'text' => 'PARAGRAPH_TEXT'
);
$db->createParagraph('COLLECTION_NAME', $paragraph);*/

// READING
/*
$p = $db->readParagraphs('COLLECTION_NAME');
foreach($p as $line) {
	echo $line['text'];
}*/

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
