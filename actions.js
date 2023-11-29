const http = require('http');

module.exports = function (self) {
	self.setActionDefinitions({
		play_playlist: {
			name: 'Play Playlist',
			options: [
			  {
				type: 'textinput',
				label: 'Playlist ID',
				id: 'id',
				default: '',
				required: true,
			  },
			],
			callback: async (action) => {
				const data = JSON.stringify({ id: action.options.id });
				const options = {
				  hostname: self.config.host,
				  port: self.config.port,
				  path: '/v1/playlist/play',
				  method: 'PUT',
				  headers: {
					'Content-Type': 'application/json',
				  },
				};
			  
				const req = http.request(options, (res) => {
				  let responseBody = '';
				  res.on('data', (chunk) => {
					responseBody += chunk;
				  });
				  res.on('end', () => {
					self.log('info', `Playlist started playing: ${responseBody}`);
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();					
				  });
				});
			  
				req.on('error', (error) => {
				  self.log('error', `Play Playlist action failed: ${error.message}`);
				});
			  
				req.write(data);
				req.end();
				self.updatePlaylistPlaybackState()
			  },
		  },

		playlist_toggle_playback: {
			name: 'Playlist: Toggle Play/Pause',
			options: [],
			callback: async () => {
				let path;
				if (self.PlaylistPlaybackState.playing) {
				path = '/v1/playlist/playback/pause'; // Pause if currently playing
				} else {
				path = '/v1/playlist/playback/play'; // Play if currently paused
				}

				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: path,
				method: 'PUT',
				};

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);// After request, update the playback state
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});

				req.end();
			},
		},

		playlist_play_next: {
			name: 'Playlist: Play Next',
			options: [],
			callback: async () => {
				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/next',
				method: 'POST',
				};

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);					// After request, update the playback state
					self.updatePlaylistPlaybackState()
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});

				req.end();
			},
		},

		playlist_play_previous: {
			name: 'Playlist: Play Previous',
			options: [],
			callback: async () => {
				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/previous',
				method: 'POST',
				};

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);					// After request, update the playback state
					self.updatePlaylistPlaybackState()
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});

				req.end();
			},
		},

		playlist_toggle_shuffle: {
			name: 'Playlist: Toggle Shuffle',
			options: [],
			callback: async () => {
				const data = JSON.stringify({ shuffle: !self.PlaylistPlaybackState.shuffle });

				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/shuffle',
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				  },				
				};

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);// After request, update the playback state
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});
				
				req.write(data);
				req.end();
			},
		},

		playlist_toggle_repeat: {
			name: 'Playlist: Toggle Repeat',
			options: [],
			callback: async () => {
				let newState;
				switch (self.PlaylistPlaybackState.repeat) {
				  case 'track':
					newState = 'playlist';
					break;
				  case 'playlist':
					newState = 'off';
					break;
				  default:
					newState = 'track';
				}
			
				const data = JSON.stringify({ repeat: newState });
				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/repeat',
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				  },				
				};

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);// After request, update the playback state
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();					
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});
				
				req.write(data);
				req.end();
			},
		},

		playlist_set_repeat: {
			name: 'Playlist: Set Repeat',
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
			callback: async (action) => {
				const data = JSON.stringify({ repeat: action.options.repeat_state });
				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/repeat',
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				  },				
				};
				self.log('info', data)

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);// After request, update the playback state
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();					
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});
				
				req.write(data);
				req.end();
			},
		},

		playlist_toggle_mute: {
			name: 'Playlist: Toggle Mute',
			options: [],
			callback: async () => {
				const data = JSON.stringify({ mute: !self.PlaylistPlaybackState.muted });

				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/mute',
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				  },				
				};

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);// After request, update the playback state
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});
				
				req.write(data);
				req.end();
			},
		},

		playlist_set_volume: {
			name: 'Playlist: Set Volume',
			options: [
				{
				  type: 'number',
				  label: 'Volume',
				  id: 'volume',
				  default: 50, // Default to 50% volume
				  min: 1,      // Minimum value 1% (0.01 in API)
				  max: 100,    // Maximum value 100% (1 in API)
				  range: true  // This makes it a slider
				}
			],
			callback: async (action) => {
				const data = JSON.stringify({ volume: action.options.volume / 100});
				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/volume',
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				  },				
				};
				self.log('info', data)

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);// After request, update the playback state
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});
				
				req.write(data);
				req.end();
			},
		},

		playlist_adjust_volume: {
			name: 'Playlist: Adjust Volume',
			options: [
				{
				  type: 'number',
				  label: 'Volume Step',
				  id: 'volume_step',
				  default: 10, // Default step
				  min: -100,
				  max: 100,
				  range: true
				}
			  ],
			callback: async (action) => {
				// Current volume as a percentage (0 - 100)
				let currentVolumePercent = self.PlaylistPlaybackState.volume * 100;
				
				// Calculate new volume
				let newVolumePercent = currentVolumePercent + action.options.volume_step;
				
				// Clamp the value between 1 and 100
				newVolumePercent = Math.max(1, Math.min(100, newVolumePercent));

				// Convert back to 0.01 - 1 range for the API
				const newVolume = newVolumePercent / 100;

				// Prepare data for the API
				const data = JSON.stringify({ volume: newVolume });

				const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: '/v1/playlist/playback/volume',
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				  },
				};
				self.log('info', data)

				const req = http.request(options, (res) => {
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);// After request, update the playback state
					// Update the PlaylistPlaybackState after the request is completed
					self.updatePlaylistPlaybackState();
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});
				
				req.write(data);
				req.end();
			},
		},

		soundboard_play_sound: {
			name: 'Soundboard: Play Sound',
			options: [
			  {
				type: 'textinput',
				label: 'Sound ID',
				id: 'id',
				default: '',
				required: true,
			  },
			],
			callback: async (action) => {
				const data = JSON.stringify({ id: action.options.id });
				const options = {
				  hostname: self.config.host,
				  port: self.config.port,
				  path: '/v1/soundboard/play',
				  method: 'PUT',
				  headers: {
					'Content-Type': 'application/json',
				  },
				};
			  
				const req = http.request(options, (res) => {
				  let responseBody = '';
				  res.on('data', (chunk) => {
					responseBody += chunk;
				  });
				  res.on('end', () => {
					self.log('info', `Sound started playing: ${responseBody}`);
					// Wait for a short period before updating the state, it seems this API endpoint is slow in the update
					setTimeout(() => {
						self.updateSoundboardPlaybackState();
					}, 1000); // Delay in milliseconds, adjust as needed
				  });
				});
			  
				req.on('error', (error) => {
				  self.log('error', `Soundboard Play Sound action failed: ${error.message}`);
				});
			  
				req.write(data);
				req.end();
			  },
		  },

		soundboard_stop_sound: {
			name: 'Soundboard: Stop Sound',
			options: [
			  {
				type: 'textinput',
				label: 'Sound ID',
				id: 'id',
				default: '',
				required: true,
			  },
			],
			callback: async (action) => {
				const data = JSON.stringify({ id: action.options.id });
				const options = {
				  hostname: self.config.host,
				  port: self.config.port,
				  path: '/v1/soundboard/stop',
				  method: 'PUT',
				  headers: {
					'Content-Type': 'application/json',
				  },
				};
			  
				const req = http.request(options, (res) => {
				  let responseBody = '';
				  res.on('data', (chunk) => {
					responseBody += chunk;
				  });
				  res.on('end', () => {
					self.log('info', `Sound stopped playing: ${responseBody}`);
					// Wait for a short period before updating the state, it seems this API endpoint is slow in the update
					setTimeout(() => {
						self.updateSoundboardPlaybackState();
					}, 1000); // Delay in milliseconds, adjust as needed
				  });
				});
			  
				req.on('error', (error) => {
				  self.log('error', `Soundboard Stop Sound action failed: ${error.message}`);
				});
			  
				req.write(data);
				req.end();
			  },
		  },

		soundboard_toggle_sound: {
			name: 'Soundboard: Toggle Sound',
			options: [
			  {
				type: 'textinput',
				label: 'Sound ID',
				id: 'id',
				default: '',
				required: true,
			  },
			],
			callback: async (action) => {
			  // Check if the sound is currently playing
			  const isPlaying = self.SoundboardPlaybackState.sounds?.some(sound => sound.id === action.options.id);
		  
			  // Determine the correct API path based on whether the sound is playing
			  const path = isPlaying ? '/v1/soundboard/stop' : '/v1/soundboard/play';
			  const data = JSON.stringify({ id: action.options.id });
		  
			  const options = {
				hostname: self.config.host,
				port: self.config.port,
				path: path,
				method: 'PUT',
				headers: {
				  'Content-Type': 'application/json',
				},
			  };
		  
			  const req = http.request(options, (res) => {
				let responseBody = '';
				res.on('data', (chunk) => {
				  responseBody += chunk;
				});
				res.on('end', () => {
				  self.log('info', `Sound Toggle action completed: ${responseBody}`);
				  setTimeout(() => {
					self.updateSoundboardPlaybackState();
				  }, 1000); // Adjust delay as needed
				});
			  });
		  
			  req.on('error', (error) => {
				self.log('error', `Soundboard Toggle Sound action failed: ${error.message}`);
			  });
		  
			  req.write(data);
			  req.end();
			},
		  },
	})
}
