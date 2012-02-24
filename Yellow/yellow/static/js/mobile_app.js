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

  console.log("Stuff ici ALSKDJ LSAKJD LSAK JDLKSA JDLAKSJ DLKSAJ DLKSA JDLSAK JDLKSA JDLASKJD LSAK JDLAKSJ DLKSAJ DLAKJD LKJSAD");
  $('.phonegap').delegate('.share_button', 'click', function() {
    var share_text = $(this).data('share') + ' ' + window.location.href;
    console.log("SHARE TEXT: " + share_text);
    window.plugins.share.show({subject: text,
			       text: text,
			       function() {},
			       function() {alert('Share failed')}});
    });

}, false)});
