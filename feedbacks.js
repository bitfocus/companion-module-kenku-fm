const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		ChannelState: {
			name: 'Example Feedback',
			type: 'boolean',
			label: 'Channel State',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Test',
					default: 5,
					min: 0,
					max: 10,
				},
			],
			callback: (feedback) => {
				console.log('Hello world!', feedback.options.num)
				if (feedback.options.num > 5) {
					return true
				} else {
					return false
				}
			},
		},
		playlist_playback_feedback: {
			name: 'Playlist Playback State',
			type: 'boolean',
			label: 'Change style if playing',
			description: 'This feedback will change the style of the button based on whether a track is currently playing.',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			
			callback: () => {
			  // Return true if playing, changing the button style
			  return self.PlaylistPlaybackState.playing;
			},
		},
		playlist_shuffle_feedback: {
			name: 'Playlist Shuffle State',
			type: 'boolean',
			label: 'Change style if playing',
			description: 'This feedback will change the style of the button based on whether Shuffle is currently on.',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			
			callback: () => {
			  // Return true if playing, changing the button style
			  return self.PlaylistPlaybackState.shuffle;
			},
		},
	})
}
