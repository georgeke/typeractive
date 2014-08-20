<?php

class DB {
	private $db;
	
	public function __construct($config){
		try {
			$client = new MongoClient();
			$this->db = $client->selectDB($config['dbname']);
		} catch (MongoConnectionException $mcx) {
			echo '<p>Couldn\'t connect to mongodb, is the "mongo" process running?</p>';
			exit();
		}
	}

	/**
	 * Creates new paragraph in given collection
	 * @param string $collection
	 * @param array $paragraph
	 * @return boolean
	 */
	public function createParagraph($collection, $paragraph){
		$category = null;
		try {
			$category = $this->db->selectCollection($collection);
		} catch (Exception $e) {
			$category = $this->db->createCollection($collection);
		}

		// Add unique id based on number of existing paragraphs.
		$numPara = 0;
		$cursor = $category->find(array('type' => 'paragraph'));
		foreach ($cursor as $paragraph) {
			$numPara += 1;
		}
		$paragraph['_id'] = $numPara+1 + "";

		$result = $result = $category->save($paragraph);
		var_dump($result);

		return $result;
	}

	/**
	 * Get array of paragraph objects, with field text
	 * @return array
	 */
	public function readParagraphs($collection){
		$paragraphs = array();

		try {
			$category = $this->db->selectCollection($collection);
			$cursor = $category->find(array('type' => 'paragraph'));

			foreach ($cursor as $paragraph) {
				array_push($paragraphs, $paragraph);
			}
		} catch (Exception $e) {
			echo "<p>Could not find collection in getParagraphs.</p>";
			exit();
		}

		return $paragraphs;
	}

	/**
	 * Update a paragraph.
	 * @return boolean
	 */
	public function update($id, $collection, $newPara){
		$category 	 = $this->db->selectCollection($collection);
		$result = $category->update(
			array('_id' => $id), 
			array('$set' => $newPara)
		);

		return $result;
	}

	/**
	 * Delete paragraph. Probably not used.
	 * @return boolean
	 */
	public function deleteParagraph($id, $collection){
		$category = $this->db->selectCollection($collection);
		$result = $category->remove(array('_id' => $id));
		return $result;
	}
}