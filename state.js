const http = require('http')

// Populate PlaylistDataState
async function fetchPlaylistData(self) {
	const options = {
		hostname: self.config.host,
		port: self.config.port,
		path: '/v1/playlist',
		method: 'GET',
	}

	return new Promise((resolve, reject) => {
		const req = http.request(options, (res) => {
			let data = ''

			res.on('data', (chunk) => {
				data += chunk
			})
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(data)
					// Update the PlaylistDataState with the received data
					self.PlaylistDataState.playlists = parsedData.playlists
					self.PlaylistDataState.tracks = parsedData.tracks
					resolve()
				} catch (e) {
					self.log('error', 'Failed to parse playlist data: ' + e.message)
					reject(e)
				}
			})
		})

		req.on('error', (e) => {
			self.log('error', 'Failed to get playlist data: ' + e.message)
			self.stopPolling()
			reject(e)
		})

		req.end()
	})
}

// Populate SoundboardDataState
async function fetchSoundboardData(self) {
	const options = {
		hostname: self.config.host,
		port: self.config.port,
		path: '/v1/soundboard',
		method: 'GET',
	}

	return new Promise((resolve, reject) => {
		const req = http.request(options, (res) => {
			let data = ''

			res.on('data', (chunk) => {
				data += chunk
			})
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(data)
					// Update the PlaylistDataState with the received data
					self.SoundboardDataState.soundboards = parsedData.soundboards
					self.SoundboardDataState.sounds = parsedData.sounds
					resolve()
				} catch (e) {
					self.log('error', 'Failed to parse soundboard data: ' + e.message)
					reject(e)
				}
			})
		})

		req.on('error', (e) => {
			self.log('error', 'Failed to get soundboard data: ' + e.message)
			self.stopPolling()
			reject(e)
		})

		req.end()
	})
}

// Populate PlaylistPlaybackState
async function updatePlaylistPlaybackState(self) {
	const options = {
		hostname: self.config.host,
		port: self.config.port,
		path: '/v1/playlist/playback',
		method: 'GET',
	}

	return new Promise((resolve, reject) => {
		const req = http.request(options, (res) => {
			let data = ''

			res.on('data', (chunk) => {
				data += chunk
			})
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(data)
					// Updating the PlaylistPlaybackState with the received data
					self.PlaylistPlaybackState.playing = parsedData.playing
					self.PlaylistPlaybackState.volume = parsedData.volume
					self.PlaylistPlaybackState.muted = parsedData.muted
					self.PlaylistPlaybackState.shuffle = parsedData.shuffle
					self.PlaylistPlaybackState.repeat = parsedData.repeat

					// For optional properties like 'track' and 'playlist', check if they exist before updating
					self.PlaylistPlaybackState.track = parsedData.track
						? {
								id: parsedData.track.id,
								url: parsedData.track.url,
								title: parsedData.track.title,
								duration: parsedData.track.duration,
								progress: parsedData.track.progress,
						  }
						: null

					self.PlaylistPlaybackState.playlist = parsedData.playlist
						? {
								id: parsedData.playlist.id,
								title: parsedData.playlist.title,
						  }
						: null

					// Update variables
					self.updateVariableValues()

					resolve(self.PlaylistPlaybackState) // Resolve the promise with the updated state
				} catch (e) {
					self.log('error', 'Failed to parse playlist playback state: ' + e.message)
					reject(e) // Reject the promise if there's an error
				}
			})
		})

		req.on('error', (e) => {
			self.log('error', 'Failed to get playlist playback state: ' + e.message)
			self.stopPolling()
			reject(e) // Reject the promise on request error
		})

		req.end()
		self.log('debug', `Updated PlaylistPlaybackState`)
	})
}

// Populate SoundboardPlaybackState
async function updateSoundboardPlaybackState(self) {
	const options = {
		hostname: self.config.host,
		port: self.config.port,
		path: '/v1/soundboard/playback',
		method: 'GET',
	}

	return new Promise((resolve, reject) => {
		const req = http.request(options, (res) => {
			let data = ''

			res.on('data', (chunk) => {
				data += chunk
			})
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(data)
					// Updating the SoundboardPlaybackState with the received data
					self.SoundboardPlaybackState.sounds = parsedData.sounds

					// Update variables & feedbacks
					self.updateVariableValues()

					resolve(self.SoundboardPlaybackState) // Resolve with the updated state
				} catch (e) {
					self.log('error', 'Failed to parse soundboard playback state: ' + e.message)
					reject(e)
				}
			})
		})

		req.on('error', (e) => {
			self.log('error', 'Failed to get soundboard playback state: ' + e.message)
			self.stopPolling()
			reject(e)
		})
		req.end()
		self.log('debug', `Updated SoundboardPlaybackState`)
	})
}

module.exports = {
	updatePlaylistPlaybackState,
	updateSoundboardPlaybackState,
	fetchSoundboardData,
	fetchPlaylistData,
}
