"use client";
import { useState } from "react";
import useFetch from "../hooks/useFetch";
import useForm from "../hooks/useForm";

const INITIAL_FORM_GENERATE_SCRIPT_DATA = {
  topic: "",
};

export default function TestGemini() {
  const [scriptRequested, setScriptRequested] = useState(false);
  
  const [showResult, setShowResult] = useState(false);
  const { formData, handleInputChange, handleReset } = useForm(
    INITIAL_FORM_GENERATE_SCRIPT_DATA
  );

  // Request logic - only triggers when scriptRequested changes
  const { loading, error, value } = useFetch(
    "/api/gemini",
    {
      method: "POST",
      body: JSON.stringify({ topic: formData.topic }),
    },
    [scriptRequested] // Only triggers when scriptRequested changes
  );

  // UI logic
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.topic.trim()) {
      setScriptRequested(true);
      setShowResult(true);
    }
  };

  const handleFormReset = () => {
    handleReset(); // Reset form data
    setShowResult(false); // Hide result without triggering API call
    setScriptRequested(false); // Reset the request trigger
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🎬 Gemini API Test
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Generate TikTok Script</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic for TikTok Video:
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="e.g., Why cats are amazing, Best pizza toppings, Morning routine tips"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !formData.topic.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Script"}
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
              Script Generation Result:
            </h3>

            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-blue-800">Generating script...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800">Error: {JSON.stringify(error)}</p>
              </div>
            )}

            {value?.script && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-green-800 font-semibold mb-2">
                  Script Generated Successfully!
                </h4>
                <div className="bg-white p-4 rounded-md">
                  <p className="whitespace-pre-wrap text-gray-800">
                    {value.script}
                  </p>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  <strong>Topic:</strong> {formData.topic}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
