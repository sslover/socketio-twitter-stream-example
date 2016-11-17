// CUSTOM JS FILE //

// set up socket.io
var socket = io();

// gets the new search term when it is changed in the input
// sends it over to the server via the socket message 'new twitter search'
function getValue(){
	var searchTerm = document.getElementById('theInput').value;

	// now send the search term to the server via a socket
  socket.emit('new twitter search', searchTerm);

	// set the searchTerm on the html  
	document.getElementById('searchTerm').innerHTML = searchTerm; 	

	// empty the existing tweets
	$('#tweets-holder').empty();	        	
}

// socket event that the server sends to the client
// every time a new tweet comes in about the search
socket.on('new tweet', function(tweet){
  $('#tweets-holder').prepend(tweet + '<br>');
});

document.getElementById('theInput').addEventListener('change', getValue);

