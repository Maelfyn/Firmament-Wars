<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	// get game tiles
	$stmt = $link->prepare('select player, units from `fwtiles` where game=? order by tile');
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($player, $units);
	
	$x = new stdClass();
	$x->tiles = [];
	$x->player = [0,0,0,0,0,0,0,0,0];
	$count = 0;
	while($stmt->fetch()){
		$x->tiles[$count++] = (object) array(
			'player' => $player, 
			'units' => $units
		);
		$x->player[$player] = 1;
	}
	// get chat messages
	$stmt = $link->prepare('select row, message, event from fwchat where row > ? and gameId=?');
	$stmt->bind_param('ii', $_SESSION['chatId'], $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($row, $message, $event);
	$x->chat = [];
	$i = 0;
	while($stmt->fetch()){
		$o = new stdClass();
		$o->message = $message;
		$o->event = $event;
		$x->chat[$i++] = $o;
		$_SESSION['chatId'] = $row;
	}
	$x->chatId = $_SESSION['chatId'];
	$x->timeout = 1000;
	echo json_encode($x);
?>