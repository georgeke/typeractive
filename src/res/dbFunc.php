<?php

include 'db.php';
include 'config.php';

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
} elseif (isset($_GET['all'])) {
	if ($_GET['all'] == '1') {
		$cats = $db->getCategories(false);

		echo json_encode($cats);
	}
} elseif (isset($_POST['collection']) and isset($_POST['p0'])) {
	$collection = $_POST['collection'];
	$db->createCategory($collection);

	// Loop through each paragraph and put it in the database.
	$i = 0;
	while($i >= 0):
		if (isset($_POST["p$i"])) {
			$text = $_POST["p$i"];

			// Filter text for non-print chars (for this purpose, anything not \x32 to \x7E)
			// > ((\()|(\{)|(\[))				 : Matches either a (, {, or [
			// > (?(2)[^\(]|(?(3)[^\{]|[^\[]))*	 : Matches * of any character other than ), }, or ], based on the above group.
			// > [^ -~]{1,}?					 : Matches /at least/ one non-print character, up to ∞
			// > (?(2)[^\(]|(?(3)[^\{]|[^\]]))*	 : Same as second clause above.
			// > (?(2)(\))|(?(3)(\})|(\])))		 : Matches a corresponding closing bracket based on groups 2-4 (in group 1)
			// > [^. ]{0,}						 : Matches anything but a space or period, such as commas.
			// >  *								 : Matches all trailing white space.
			$re = '/((\()|(\{)|(\[))(?(2)[^\(]|(?(3)[^\{]|[^\[]))*[^ -~]{1,}?(?(2)[^\(]|(?(3)[^\{]|[^\]]))*(?(2)(\))|(?(3)(\})|(\])))[^. ]{0,} */';
			$text = preg_replace($re, "", $text);
			// Matching all non-print characters not surrounded in brackets.
			$re = '/[^ -~] */';
			$text = preg_replace($re, "", $text);

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