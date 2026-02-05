import { useEffect, useRef, useState } from "react";
import { getAverageRed } from "../services/frameProcessor";
import { processSignal } from "../services/signalProcessor";
import { detectPeaks } from "../services/peakDetector";
import { calculateBPM } from "../services/heartRateCalculator";
import { validateHeartRate } from "../utils/validation";

function CameraView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [rawSignal, setRawSignal] = useState([]);
  const [smoothSignal, setSmoothSignal] = useState([]);
  const [beatCount, setBeatCount] = useState(0);
  const [bpm, setBpm] = useState(0);
  const [status, setStatus] = useState("Click Start to Measure");
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // ▶️ Start Measurement
  async function startMeasurement() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = stream;

      setRawSignal([]);
      setSmoothSignal([]);
      setBeatCount(0);
      setBpm(0);

      setStartTime(Date.now());
      setIsMeasuring(true);
      setStatus("Measuring...");
    } catch (err) {
      console.error(err);
    }
  }

  // ⏳ Stop Automatically After 30 Seconds
  useEffect(() => {
    if (!isMeasuring) return;

    const timer = setTimeout(() => {
      stopMeasurement();
    }, 30000);

    return () => clearTimeout(timer);
  }, [isMeasuring]);

  // 📊 Capture Frames
  useEffect(() => {
    if (!isMeasuring) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");

      if (video.readyState === 4) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const redValue = getAverageRed(frame);

        setRawSignal(prev => [...prev.slice(-200), redValue]);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isMeasuring]);

  // 🧠 Process Signal
  useEffect(() => {
    setSmoothSignal(processSignal(rawSignal));
  }, [rawSignal]);

  // ❤️ Detect Beats
  useEffect(() => {
    if (smoothSignal.length > 50) {
      setBeatCount(detectPeaks(smoothSignal));
    }
  }, [smoothSignal]);

  // 💓 Calculate BPM
  useEffect(() => {
    if (beatCount > 0 && startTime) {
      const duration = (Date.now() - startTime) / 1000;
      setBpm(calculateBPM(beatCount, duration));
    }
  }, [beatCount, startTime]);

  // 🧠 Validate
  useEffect(() => {
    const result = validateHeartRate(bpm, smoothSignal.length);
    setStatus(result.message);
  }, [bpm, smoothSignal]);

  // 🛑 Stop Camera
  function stopMeasurement() {
    setIsMeasuring(false);
    setStatus("Measurement Complete");

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  }

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline width="250" />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <p>Beats: {beatCount}</p>
      <p>Heart Rate: {bpm ? bpm + " BPM" : "--"}</p>
      <p>Status: {status}</p>

      {!isMeasuring && (
        <button onClick={startMeasurement}>Start Measurement</button>
      )}
    </div>
  );
}

export default CameraView;

