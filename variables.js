module.exports = async function (self) {
	self.setVariableDefinitions([
		{ variableId: 'current_track_title', name: 'Current playing track title' },
		{ variableId: 'current_track_progress', name: 'Current playing track progress' },	
		{ variableId: 'current_track_duration', name: 'Current playing track duration' },	
		{ variableId: 'current_playlist_title', name: 'Current playing playlist title' },	
		{ variableId: 'volume', name: 'Volume' },	
		{ variableId: 'muted', name: 'Muted' },	
		{ variableId: 'shuffle', name: 'Shuffle' },	
		{ variableId: 'playing', name: 'Playing' },	
	])
}
