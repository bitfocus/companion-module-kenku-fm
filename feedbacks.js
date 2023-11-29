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
		playlist_feedback: {
			name: 'Playlist',
			type: 'boolean',
			label: 'Change style if playing',
			description: 'This feedback will change the style of the button based on your selected playlist ID.',
			options: [
				{
				  type: 'textinput',
				  label: 'Playlist ID',
				  id: 'id',
				  default: '',
				  required: true,
				},
			  ],  
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			
			callback: (feedback) => {
			  // Return true if playing, changing the button style
			  return self.PlaylistPlaybackState.playlist?.id === feedback.options.id;
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
		playlist_mute_feedback: {
			name: 'Playlist Mute State',
			type: 'boolean',
			label: 'Change style if playing',
			description: 'This feedback will change the style of the button based on whether Mute is currently on.',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			
			callback: () => {
			  // Return true if playing, changing the button style
			  return self.PlaylistPlaybackState.muted;
			},
		},		
		playlist_repeat_feedback: {
			name: 'Playlist Repeat State',
			type: 'boolean',
			label: 'Change style if selected state',
			description: 'This feedback will change the style of the button based on whether what Repeat state is on and selected.',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
				  id: 'repeat_state',
				  type: 'dropdown',
				  label: 'Repeat State',
				  default: 'off', // Set a default value
				  choices: [
					{ id: 'track', label: 'Track' },
					{ id: 'playlist', label: 'Playlist' },
					{ id: 'off', label: 'Off' },
				  ],
				},
			  ],
			callback: (feedback) => {
				// Check if the current repeat state matches the user-selected state
				return self.PlaylistPlaybackState.repeat === feedback.options.repeat_state;
			},
		},
		soundboard_sound_feedback: {
			name: 'Soundboard Sound',
			type: 'boolean',
			label: 'Change style if playing',
			description: 'This feedback will change the style of the button based on your selected Sound ID.',
			options: [
				{
				  type: 'textinput',
				  label: 'Sound ID',
				  id: 'id',
				  default: '',
				  required: true,
				},
			  ],  
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			
			callback: (feedback) => {
				// Check if the sound with the given ID is in the currently playing sounds
				return self.SoundboardPlaybackState.sounds.some(sound => sound.id === feedback.options.id);			},
		},
	})
}
