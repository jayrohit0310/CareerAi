export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.addEventListener('dataavailable', event => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.start();
    } catch (err) {
      console.error('Error starting audio recording:', err);
      throw err;
    }
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        return resolve(null);
      }

      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      });

      this.mediaRecorder.stop();
    });
  }
}
