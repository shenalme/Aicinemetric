
/**
 * Extracts a specific number of frames from a video file at regular intervals.
 */
export async function extractFrames(
  videoFile: File,
  count: number = 10
): Promise<{ data: string; timestamp: number }[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;

    const frames: { data: string; timestamp: number }[] = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const interval = duration / (count + 1);

      for (let i = 1; i <= count; i++) {
        const timestamp = i * interval;
        video.currentTime = timestamp;

        await new Promise((res) => {
          video.onseeked = res;
        });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
          frames.push({ data: base64, timestamp });
        }
      }

      URL.revokeObjectURL(video.src);
      resolve(frames);
    };

    video.onerror = (e) => reject(e);
  });
}
