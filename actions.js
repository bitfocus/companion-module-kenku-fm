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
				  });
				});
			  
				req.on('error', (error) => {
				  self.log('error', `Play Playlist action failed: ${error.message}`);
				});
			  
				req.write(data);
				req.end();
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
					self.log('debug', `Request to ${options.path} sent, status code: ${res.statusCode}`);					// After request, update the playback state
					self.updatePlaylistPlaybackState()
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
				});
				req.on('error', (e) => {
				self.log('error', `Error sending toggle request: ${e.message}`);
				});
				
				req.write(data);
				req.end();
				self.updatePlaylistPlaybackState()
			},
		},		
	})
}
