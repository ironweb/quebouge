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

  $('#supertimor').click(function() {
    window.plugins.share.show(
      {subject: 'I like turtles',
       text: 'http://www.mndaily.com'},
       function() {},
      function() {alert('Share failed')}
    );
  });

  console.log("bob");

}, false)});
