import CameraView from "./components/CameraView";

function App() {
  return (
    <div className="app">
      <h1>Heart Rate Monitor</h1>
      <p>Place your finger on the camera to begin.</p>
      <CameraView />
    </div>
  );
}

export default App;

