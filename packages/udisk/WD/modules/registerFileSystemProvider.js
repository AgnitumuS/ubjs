module.exports = function(name){
	require('models/WD/modules/WebDav.js').registerProvider(name, require('models/WD/_providers/webDavFileSystemProvider.js'));
}