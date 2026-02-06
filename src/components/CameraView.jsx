import { useEffect, useRef, useState } from "react";

export default function CameraView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [beats, setBeats] = useState(0);
  const [bpm, setBpm] = useState("--");
  const [status, setStatus] = useState("Press Start");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [fingerPlaced, setFingerPlaced] = useState(false);

  // Refs (persist across renders)
  const signalRef = useRef([]);
  const peakTimesRef = useRef([]);
  const startTimeRef = useRef(null);
  const fingerStartTimeRef = useRef(null);

  // START CAMERA + TORCH
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      videoRef.current.srcObject = stream;

      // 🔦 Try to turn torch ON
      const track = stream.getVideoTracks()[0];
      if (track.getCapabilities?.().torch) {
        await track.applyConstraints({ advanced: [{ torch: true }] });
      }

      resetAll();
      setRunning(true);
      setStatus("Place finger on camera");
    } catch (err) {
      setStatus("Camera access denied");
    }
  }

  function resetAll() {
    signalRef.current = [];
    peakTimesRef.current = [];
    startTimeRef.current = null;
    fingerStartTimeRef.current = null;
    setBeats(0);
    setBpm("--");
    setSeconds(0);
    setFingerPlaced(false);
  }

  // MAIN LOOP
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;

      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }

      const avgR = r / n;
      const avgG = g / n;
      const avgB = b / n;

      // ✋ FINGER DETECTION
      const fingerDetected = avgR > avgG + 20 && avgR > avgB + 20;

      if (!fingerDetected) {
        // Finger removed → pause measurement
        resetAll();
        setStatus("Place finger on camera");
        return;
      }

      // Finger just placed
      if (!fingerPlaced) {
        fingerStartTimeRef.current = Date.now();
        startTimeRef.current = Date.now();
        setFingerPlaced(true);
        setStatus("Measuring...");
      }

      // Store signal ONLY after finger placed
      signalRef.current.push(avgR);
      if (signalRef.current.length > 300) signalRef.current.shift();

      detectBeat();

      // TIMER starts ONLY after finger placed
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      setSeconds(elapsed);

      if (elapsed >= 30) {
        finishMeasurement();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [running, fingerPlaced]);

  // BEAT DETECTION
  function detectBeat() {
    const s = signalRef.current;
    if (s.length < 3) return;

    const i = s.length - 2;
    const max = Math.max(...s);
    const min = Math.min(...s);
    const threshold = min + 0.6 * (max - min);

    if (s[i] > threshold && s[i] > s[i - 1] && s[i] > s[i + 1]) {
      const now = Date.now();
      const last = peakTimesRef.current.at(-1) || 0;

      if (now - last > 400) {
        peakTimesRef.current.push(now);
        setBeats(peakTimesRef.current.length);
      }
    }
  }

  // FINISH AFTER 30s
  function finishMeasurement() {
    const peaks = peakTimesRef.current;

    if (peaks.length < 2) {
      setStatus("Pulse not detected");
      stop();
      return;
    }

    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push((peaks[i] - peaks[i - 1]) / 1000);
    }

    const avgInterval =
      intervals.reduce((a, b) => a + b, 0) / intervals.length;

    const finalBpm = Math.round(60 / avgInterval);
    setBpm(finalBpm);
    setStatus("Measurement complete");
    stop();
  }

  function stop() {
    setRunning(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <video ref={videoRef} autoPlay playsInline width="260" />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <h3>Beats: {beats}</h3>
      <h2>Heart Rate: {bpm} BPM</h2>
      <p>Status: {status}</p>
      <p>Time: {seconds}s / 30s</p>

      {!running && <button onClick={start}>Start</button>}
    </div>
  );
}





