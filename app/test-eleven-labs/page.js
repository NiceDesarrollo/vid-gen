"use client";
import { useState } from "react";
import useFetch from "../hooks/useFetch";
import useForm from "../hooks/useForm";

const INITIAL_FORM_GENERATE_VOICE_DATA = {
  script: "",
};

export default function TestElevenLabs() {
  const [voiceRequested, setVoiceRequested] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { formData, handleInputChange, handleReset } =
    useForm(INITIAL_FORM_GENERATE_VOICE_DATA);

  // Request logic - only triggers when scriptRequested changes
  const { loading, error, value } = useFetch(
    "/api/elevenLabs",
    {
      method: "POST",
      body: JSON.stringify({ script: formData.script }),
    },
    [voiceRequested] // Only triggers when scriptRequested changes
  );

  // UI logic
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.script.trim()) {
      setVoiceRequested(true);
      setShowResult(true);
    }
  };

  const handleFormReset = () => {
    handleReset(); // Reset form data
    setShowResult(false); // Hide result without triggering API call
    setVoiceRequested(false); // Reset the request trigger
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🎤 ElevenLabs API Test
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Generate Voice from Text</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text to Convert to Speech:
            </label>
            <textarea
              name="script"
              value={formData.script}
              onChange={handleInputChange}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !formData.script.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Voice"}
            </button>

            <button
              type="button"
              onClick={handleFormReset}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Form
            </button>
          </div>
        </form>

        {showResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Voice Generation Result:
            </h3>

            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-blue-800">Generating voice...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800">Error: {JSON.stringify(error)}</p>
              </div>
            )}

            {value?.audio && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-green-800 font-semibold mb-2">
                  Voice Generated Successfully!
                </h4>
                <div className="bg-white p-4 rounded-md">
                  <p className="whitespace-pre-wrap text-gray-800">
                    {value.script}
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  <audio 
                    controls 
                    className="w-full"
                    src={`data:audio/mp3;base64,${value.audio}`}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:audio/mp3;base64,${value.audio}`;
                      link.download = 'generated-voice.mp3';
                      link.click();
                    }}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Download Audio
                  </button>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  <strong>Format:</strong> {value.format}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
