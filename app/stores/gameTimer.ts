export const useGameTimerStore = defineStore('gameTimer', {
  state: () => ({
    elapsedTime: 0,
    isRunning: false,
    startTime: null as number | null,
    intervalId: null as ReturnType<typeof setInterval> | null,
  }),

  getters: {
    // Format elapsed time as HH:MM:SS
    formattedTime(): string {
      const totalSeconds = Math.floor(this.elapsedTime / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      return [minutes, seconds]
        .map(unit => String(unit).padStart(2, '0'))
        .join(':')
    },
  },

  actions: {
    // Start or resume the timer
    start() {
      if (this.isRunning) return

      this.isRunning = true
      this.startTime = Date.now()

      // Update every 10ms for smooth display
      this.intervalId = setInterval(() => {
        if (this.startTime !== null) {
          const now = Date.now()
          const delta = now - this.startTime
          this.elapsedTime += delta
          this.startTime = now
        }
      }, 1000)
    },

    // Pause the timer
    pause() {
      if (!this.isRunning) return

      this.isRunning = false

      // Calculate final elapsed time before pausing
      if (this.startTime !== null) {
        const now = Date.now()
        this.elapsedTime += now - this.startTime
        this.startTime = null
      }

      this.cleanup()
    },

    // Reset the timer to zero
    reset() {
      this.pause()
      this.elapsedTime = 0
    },

    // Clean up interval on store disposal
    cleanup() {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
    },
  },
})
