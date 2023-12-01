const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const { combineRgb } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const stateFunctions = require('./state')
const http = require('http')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.PlaylistPlaybackState = {
			playing: false,
			volume: null,
			muted: false,
			shuffle: false,
			repeat: 'off',
			track: null,
			playlist: null,
		}
		this.SoundboardPlaybackState = {
			sounds: [],
		}

		this.PlaylistDataState = {
			soundboards: [],
			sounds: [],
		}

		this.SoundboardDataState = {
			playlists: [],
			tracks: [],
		}

		this.pollingInterval = null
		this.presetsPollInterval = null
		this.apiCheckIntervalMs = null
		this.isPollingActive = false
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions

		this.startAndCheckApiAvailability((isAvailable) => {
			if (isAvailable) {
				if (!this.isPollingActive) {
					// Get initial state
					stateFunctions.updatePlaylistPlaybackState(this)
					stateFunctions.updateSoundboardPlaybackState(this)
					this.generatePresets()

					// Start Polling
					this.startPolling()
					this.startPresetsPolling()
					this.isPollingActive = true
				}
			} else {
				this.log('warn', 'Waiting for API to be available...')
			}
		})
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
		this.stopPolling()
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

	startPresetsPolling() {
		const presetsPollIntervalMs = 30000 // For example, poll every 30 seconds for presets

		const poll = async (updateFunction) => {
			try {
				await updateFunction()
			} catch (error) {
				this.log('error', `Polling attempt for ${updateFunction.name} failed: ${error.message}`)
			}
		}

		this.presetsPollInterval = setInterval(() => {
			poll(this.generatePresets.bind(this))
		}, presetsPollIntervalMs)
	}

	startPolling() {
		const pollIntervalMs = 4000 // Poll every 4000 milliseconds (4 seconds)

		// Polling function that can be reused for different state updates
		const poll = async (updateFunction) => {
			try {
				await updateFunction()
			} catch (error) {
				this.log('error', `Polling attempt for ${updateFunction.name} failed: ${error.message}`)
			}
		}

		this.pollingInterval = setInterval(() => {
			poll(() => stateFunctions.updatePlaylistPlaybackState(this))
			poll(() => stateFunctions.updateSoundboardPlaybackState(this))
		}, pollIntervalMs)
	}

	stopPolling() {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
			this.pollingInterval = null
		}
		if (this.presetsPollInterval) {
			clearInterval(this.presetsPollInterval)
			this.presetsPollInterval = null
		}
		this.isPollingActive = false // Indicate that polling has stopped
	}

	async generatePresets() {
		const presets = {}
		this.log('debug', 'Generating Presets')
		await stateFunctions.fetchPlaylistData(this)
		this.PlaylistDataState.playlists?.forEach((playlist, index) => {
			presets[`playlist_${index}`] = {
				type: 'button',
				category: 'Playlists',
				name: `Play: ${playlist.title}`,
				style: {
					text: playlist.title,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0), // Example color
				},
				steps: [
					{
						down: [
							{
								actionId: 'play_playlist',
								options: {
									id: playlist.id,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'playlist_feedback',
						options: {
							id: playlist.id,
						},
						style: {
							// The style property is only valid for 'boolean' feedbacks, and defines the style change it will have.
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 255, 0),
						},
					},
				],
			}
		})
		await stateFunctions.fetchSoundboardData(this)
		this.SoundboardDataState.sounds?.forEach((sound, index) => {
			presets[`sound_${index}`] = {
				type: 'button',
				category: 'Sounds',
				name: `Play: ${sound.title}`,
				style: {
					text: sound.title,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'soundboard_toggle_sound',
								options: {
									id: sound.id,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'soundboard_sound_feedback',
						options: {
							id: sound.id,
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 255, 0),
						},
					},
				],
			}
		})
		this.setPresetDefinitions(presets)
	}

	startAndCheckApiAvailability(callback) {
		const apiCheckIntervalMs = 10000

		const checkApi = () => {
			const options = {
				hostname: this.config.host,
				port: this.config.port,
				path: '/v1/playlist',
				method: 'GET',
			}

			const req = http.request(options, (res) => {
				if (res.statusCode === 200) {
					callback(true)
					this.log('debug', 'API Healthy')
				} else {
					callback(false)
				}
			})

			req.on('error', () => {
				callback(false)
			})

			req.end()
		}

		setInterval(checkApi, apiCheckIntervalMs)
	}

	updateVariableValues() {
		this.checkFeedbacks(
			'playlist_playback_feedback',
			'playlist_shuffle_feedback',
			'playlist_repeat_feedback',
			'playlist_feedback',
			'playlist_mute_feedback',
			'soundboard_sound_feedback'
		)

		// Set the new values for the variables
		this.setVariableValues({
			current_track_title: this.PlaylistPlaybackState.track?.title || 'None',
			current_track_progress: this.PlaylistPlaybackState.track?.progress || 'None',
			current_track_duration: this.PlaylistPlaybackState.track?.duration || 'None',
			current_playlist_title: this.PlaylistPlaybackState.playlist?.title || 'None',
			volume: this.PlaylistPlaybackState?.volume || 'False',
			muted: this.PlaylistPlaybackState?.muted || 'False',
			shuffle: this.PlaylistPlaybackState?.shuffle || 'False',
			playing: this.PlaylistPlaybackState?.playing || 'False',
			repeat: this.PlaylistPlaybackState?.repeat || 'off',
		})
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
