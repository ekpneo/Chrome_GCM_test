// A global variable that contains the server URL 
var url;

function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    alert('Runtime Error:' + chrome.runtime.lastError.message);
    return;
  }
  sendRegistrationId(registrationId, function(obj, s, xhr) {
    chrome.storage.local.set({registered: true});
  });
}

function sendRegistrationId(registrationId, callback) {
  var fullURL = url + '?reg_id=' + registrationId;
  $.get(fullURL, callback).fail(function(){
    alert('Failed to send the info to the server');
  });
}

var addAudio = function() {
	var audio = document.createElement("AUDIO");
	var src = document.createElement("SOURCE");
	src.setAttribute("src","audio/notification.mp3");
	src.setAttribute("type", "audio/mpeg");
	audio.appendChild(src);
	document.body.appendChild(audio);

	return audio;
};

var audio = null;

chrome.runtime.onStartup.addListener(function() {
	audio = addAudio();
  chrome.storage.local.get("registered", function(result) {
    if (result["registered"]){
      console.log('* reg_id already registered.');
      console.log('* If you want to re-register, type "chrome.storage.local.set({registered: false});" in Insepctor.');
      return;
    }

    $.get('/config.json', function(data){
        var config = JSON.parse(data);
        var senderIds = [''+config['sender_id']];
        url = config['url']; 
        chrome.gcm.register(senderIds, registerCallback);
    });
  });
});

chrome.gcm.onMessage.addListener(function(message){
    chrome.notifications.create('', {
        'type': 'basic',
        'iconUrl': '/' + message.data.icon + '.png',
        'title': 'Message from Server',
        'message': message.data.msg
    }, function(){
			audio.play();
    });
});
