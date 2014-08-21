<!DOCTYPE html>

<html>
<head>
	<meta charset="UTF-8">
	<title>Typeractive</title>
	<script src="scraper.js"></script>
	<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
</head>	

<body>

<article>
	<form>
		Page: <input type="text" id="urlForm"></input>
	</form>
	<button value="Go" onclick="Scraper.parsePage()"><p>Enter</p></button>
	<button value="Q" onclick="Scraper.readDB()"><p>Query</p></button>
	<p id="output"></p>
	<p id="msg"></p>
</article>

</body>

</html>
