const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const http = require('http');


class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal);
		this.PlaylistPlaybackState = {
			playing: false,
			volume: null,
			muted: false,
			shuffle: false,
			repeat: 'off',
			track: null,
			playlist: null,
		  };
		this.pollingInterval = null;
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		//this.startPolling()

	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy');
		this.stopPolling();
	}

	async configUpdated(config) {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				default: '127.0.0.1',
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				default: '3333',
				regex: Regex.PORT,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	startPolling() {
		const pollIntervalMs = 3000; // Poll every 1000 milliseconds (1 second)
		this.pollingInterval = setInterval(async () => {
			try {
			  await this.updatePlaylistPlaybackState();
			  // Successfully updated the state, so no need for further action in this interval
			} catch (error) {
			  this.log('error', `Polling attempt failed: ${error.message}`);
			  // The retry mechanism is inherently part of the next interval iteration.
			}
		  }, pollIntervalMs);
		}

	stopPolling() {
		if (this.pollingInterval) {
		clearInterval(this.pollingInterval);
		this.pollingInterval = null;
		}
	}

	
	async updatePlaylistPlaybackState() {
		const options = {
		  hostname: this.config.host,
		  port: this.config.port,
		  path: '/v1/playlist/playback',
		  method: 'GET',
		};
	  
		return new Promise((resolve, reject) => {
		  const req = http.request(options, (res) => {
			let data = '';
			
			res.on('data', (chunk) => {
			  data += chunk;
			});
			res.on('end', () => {
			  try {
				const parsedData = JSON.parse(data);
				// Updating the PlaylistPlaybackState with the received data
				this.PlaylistPlaybackState.playing = parsedData.playing;
				this.PlaylistPlaybackState.volume = parsedData.volume;
				this.PlaylistPlaybackState.muted = parsedData.muted;
				this.PlaylistPlaybackState.shuffle = parsedData.shuffle;
				this.PlaylistPlaybackState.repeat = parsedData.repeat;

				// For optional properties like 'track' and 'playlist', check if they exist before updating
				this.PlaylistPlaybackState.track = parsedData.track ? {
				id: parsedData.track.id,
				url: parsedData.track.url,
				title: parsedData.track.title,
				duration: parsedData.track.duration,
				progress: parsedData.track.progress,
				} : null;

				this.PlaylistPlaybackState.playlist = parsedData.playlist ? {
				id: parsedData.playlist.id,
				title: parsedData.playlist.title,
				} : null;

				// Update variables
				this.updateVariableValues();

				resolve(this.PlaylistPlaybackState); // Resolve the promise with the updated state
				} catch (e) {
				this.log('error', 'Failed to parse playlist playback state: ' + e.message);
				reject(e); // Reject the promise if there's an error
				}
			});
		  });
	  
		  req.on('error', (e) => {
			this.log('error', 'Failed to get playlist playback state: ' + e.message);
			reject(e); // Reject the promise on request error
		  });
	  
		  req.end();
		});
	  }


	updateVariableValues() {
	this.log('debug', `Updated PlaylistPlaybackState`);
	this.checkFeedbacks('playlist_playback_feedback', 'playlist_shuffle_feedback');

	// Set the new values for the variables
	this.setVariableValues({
		'current_track_title': this.PlaylistPlaybackState.track?.title || 'None',
		'current_track_progress': this.PlaylistPlaybackState.track?.progress || 'None',
		'current_track_duration': this.PlaylistPlaybackState.track?.duration || 'None',
		'current_playlist_title': this.PlaylistPlaybackState.playlist?.title || 'None',
		'volume': this.PlaylistPlaybackState?.volume || 'False',
		'muted': this.PlaylistPlaybackState?.muted || 'False',		
		'shuffle': this.PlaylistPlaybackState?.shuffle || 'False',		
		'playing': this.PlaylistPlaybackState?.playing || 'False',		
		});
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
