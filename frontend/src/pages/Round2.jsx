// frontend/src/pages/Round2.jsx
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
// Assuming you have these components or similar in your project
// If they don't exist exactly, you might need to adjust imports.
// For now, using standard HTML/Tailwind fallbacks if they are missing.
import GlassCard from "../components/UI"; // Might need to check exact exports
import AnimatedButton from "../components/UI"; // Might need to check exact exports

export default function Round2() {
  // If there's an app store or socket context, use it. For now, basic state.
  // const { socket } = useAppStore(); // from original prompt
  const { user } = useAuth(); // Assuming useAuth gives user context
  const [config, setConfig] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial config
  useEffect(() => {
    api.get("/cipher-config/round2")
      .then((r) => setConfig(r.data))
      .catch(() => {}); // Not announced yet
  }, []);

  // Live push when admin announces config (mocked socket for now)
  /*
  useEffect(() => {
    if (!socket) return;
    socket.on("round2:config", (data) => setConfig(data));
    return () => socket.off("round2:config");
  }, [socket]);
  */

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/zip": [".zip"] },
    maxFiles: 1,
    onDrop: (accepted) => setFile(accepted[0]),
  });

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    const form = new FormData();
    form.append("vault", file);
    try {
      // Assuming api wrapper adds token automatically
      const { data } = await api.post("/round2/submit", form);
      setResult(data);
    } catch (err) {
      setResult({ error: err.response?.data?.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-cyan-400 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-cyan-300">Round 2 — The Architect</h1>

      {/* Live Config Panel */}
      <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800 shadow-xl backdrop-blur-md">
        <h2 className="text-xl font-semibold mb-4 text-teal-300">🔐 Live Cipher Config</h2>
        {!config ? (
          <p className="text-yellow-400 animate-pulse">Waiting for organizer to announce...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div><span className="text-gray-400">Assigned Team Name:</span>
              <p className="text-white text-lg">{config.assignedTeamName}</p></div>
            <div><span className="text-gray-400">Password Word:</span>
              <p className="text-white text-lg">{config.passwordWord}</p></div>
            <div><span className="text-gray-400">Folder Cipher:</span>
              <p className="text-cyan-300">{config.folderCipherName}</p></div>
            <div><span className="text-gray-400">Password Encryption:</span>
              <p className="text-cyan-300">
                {config.passwordCipher1Name} → {config.passwordCipher2Name}
              </p></div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800 shadow-xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-teal-300 mb-2">📋 What to do</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
          <li>Encode the assigned team name using <strong>Folder Cipher</strong> → use as folder name</li>
          <li>Encrypt the password word using <strong>Cipher 1</strong>, then encrypt result using <strong>Cipher 2</strong></li>
          <li>Create a folder with encoded name, put a <code>.txt</code> inside with your original team name</li>
          <li>ZIP the folder with the final encrypted password, then upload below</li>
        </ol>
      </div>

      {/* ZIP Upload */}
      <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800 shadow-xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-teal-300 mb-3">📦 Upload Your Vault</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive ? "border-cyan-400 bg-cyan-950" : "border-gray-600 hover:border-cyan-600"}`}
        >
          <input {...getInputProps()} />
          {file
            ? <p className="text-green-400">✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            : <p className="text-gray-400">Drop your vault.zip here, or click to select</p>
          }
        </div>
        <button
          onClick={handleSubmit}
          disabled={!file || submitting || !config}
          className="mt-4 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded transition-all disabled:opacity-50"
        >
          {submitting ? "Validating..." : "Submit Vault"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-800 shadow-xl backdrop-blur-md">
          <h2 className="text-lg font-semibold text-teal-300 mb-3">📊 Validation Result</h2>
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl font-bold text-cyan-300">
                Score: {result.score} / 30
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm mt-2">
                {[
                  ["Folder Name", result.breakdown?.folderName, 10],
                  ["Cipher 1", result.breakdown?.cipher1, 10],
                  ["Cipher 2", result.breakdown?.cipher2, 10],
                ].map(([label, pts, max]) => (
                  <div key={label}
                    className={`rounded p-2 text-center border ${pts === max ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}`}>
                    <div className="font-mono">{pts}/{max}</div>
                    <div className="text-xs">{label}</div>
                  </div>
                ))}
              </div>
              {result.errors?.length > 0 && (
                <ul className="text-red-400 text-sm mt-2 space-y-1">
                  {result.errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
