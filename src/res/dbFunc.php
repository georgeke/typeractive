<?php

include 'db.php';
include 'config.php';

// Uncomment if testing requests not through console.php
$db = new DB($config);

if (isset($_GET['collection'])) {
	$category = $_GET['collection'];
	$p = $db->readParagraphs($category);
	$response = array();

	$i = 0;
	foreach($p as $line) {
		$response["p$i"] = $line['text'];
		$i++;
	}

	echo json_encode($response);
} elseif (isset($_POST['collection']) and isset($_POST['p0'])) {
	$collection = $_POST['collection'];
	$db->createCategory($collection);

	// Loop through each paragraph and put it in the database.
	$i = 0;
	while($i >= 0):
		if (isset($_POST["p$i"])) {
			$text = $_POST["p$i"];
			$paragraph = array(
				'_id' => ''+$i,
				'type' => 'paragraph',
				'text' => $text
			);
			$result = $db->createParagraph($collection, $paragraph);

			if (isset($result['err']) and $result['err'] != null) {
				header($_SERVER["SERVER_PROTOCOL"]." 201 Created");
			} else {
				header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
			}
		} else {
			break;
		}
		$i += 1;
	endwhile;
}

?>