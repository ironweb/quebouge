Zepto(function() {document.addEventListener("deviceready", function() {

  var Share = function() {};

  Share.prototype.show = function(content, success, fail) {
	return PhoneGap.exec( function(args) {
		success(args);
	}, function(args) {
		fail(args);
	}, 'Share', '', [content]);
  };

  PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin('share', new Share());
	PluginManager.addService("Share", "net.abourget.quebouge.Share");
  });
  
  $('body').addClass('phonegap');

  $('.phonegap').delegate('.share_button', 'click', function() {
    var share_text = $(this).data('share') + ' - http://quebouge.com'; 
    //console.log("SHARE TEXT: " + share_text);
    window.plugins.share.show({subject: share_text,
			       text: share_text},
			      function() {},
			      function() {alert('Share failed')}
			     );
    });

}, false)});
