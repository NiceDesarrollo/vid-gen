"use client";
import { useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";
import useForm from "../hooks/useForm";
import { createApi } from "unsplash-js";

const INITIAL_FORM_DATA = {
  query: "",
  count: 4,
  orientation: "landscape"
};

// Create Unsplash API client for direct SDK usage
const unsplashApi = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE"
});

// Photo Component for SDK results
const PhotoComp = ({ photo }) => {
  const { user, urls } = photo;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <img 
        className="w-full h-48 object-cover" 
        src={urls.regular} 
        alt={photo.alt_description || "Unsplash photo"}
      />
      <div className="p-3 bg-gray-50">
        <p className="text-xs text-gray-600 font-semibold mb-1">
          Photo {photo.id}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          {photo.width} × {photo.height}
        </p>
        <p className="text-xs text-blue-600 mb-1">
          By: <a 
            href={`https://unsplash.com/@${user.username}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline"
          >
            {user.name}
          </a>
        </p>
        <div className="flex gap-1 flex-wrap">
          {photo.tags?.slice(0, 3).map((tag, tagIndex) => (
            <span key={tagIndex} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
              {tag.title || tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TestUnsplash() {
  const [searchRequested, setSearchRequested] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [sdkData, setSdkData] = useState(null);
  const [sdkLoading, setSdkLoading] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const [useSdk, setUseSdk] = useState(false);
  
  const { formData, handleInputChange, handleReset } = useForm(INITIAL_FORM_DATA);

  // Request logic for API route - only triggers when searchRequested changes
  const { loading, error, value } = useFetch(
    "/api/unsplash",
    {
      method: "POST",
      body: JSON.stringify(formData),
    },
    [searchRequested] // Only triggers when searchRequested changes
  );

  // SDK search function
  const searchWithSdk = async () => {
    if (!formData.query.trim()) return;
    
    setSdkLoading(true);
    setSdkError(null);
    
    try {
      const result = await unsplashApi.search.getPhotos({ 
        query: formData.query, 
        orientation: formData.orientation,
        perPage: Math.min(Math.max(formData.count, 1), 30)
      });
      
      if (result.errors) {
        setSdkError(result.errors[0]);
      } else {
        setSdkData(result);
      }
    } catch (err) {
      setSdkError("Something went wrong with the SDK search!");
      console.error("SDK Error:", err);
    } finally {
      setSdkLoading(false);
    }
  };

  // UI logic
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.query.trim()) {
      if (useSdk) {
        searchWithSdk();
      } else {
        setSearchRequested(true);
      }
      setShowResult(true);
    }
  };

  const handleFormReset = () => {
    handleReset(); // Reset form data
    setShowResult(false); // Hide result without triggering API call
    setSearchRequested(false); // Reset the request trigger
    setSdkData(null); // Reset SDK data
    setSdkError(null); // Reset SDK error
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          📸 Unsplash Image Search Test
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-semibold">✨ Using Unsplash API - 100% FREE!</p>
          <p className="text-blue-700 text-sm">High-quality stock photos with proper attribution to photographers</p>
        </div>

        {/* Method Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Choose Search Method</h2>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="method"
                checked={!useSdk}
                onChange={() => setUseSdk(false)}
                className="mr-2"
              />
              <span>API Route (Server-side)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="method"
                checked={useSdk}
                onChange={() => setUseSdk(true)}
                className="mr-2"
              />
              <span>SDK (Client-side)</span>
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {useSdk ? 
              "Using Unsplash SDK directly in the browser. Make sure to set NEXT_PUBLIC_UNSPLASH_ACCESS_KEY in your .env.local file." :
              "Using our custom API route. More secure and allows for server-side processing."
            }
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Search Images on Unsplash</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Keywords:
            </label>
            <input
              type="text"
              name="query"
              value={formData.query}
              onChange={handleInputChange}
              placeholder="e.g., nature, technology, food, travel, business"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Images:
              </label>
              <select
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Image</option>
                <option value={2}>2 Images</option>
                <option value={4}>4 Images</option>
                <option value={6}>6 Images</option>
                <option value={8}>8 Images</option>
                <option value={10}>10 Images</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientation:
              </label>
              <select
                name="orientation"
                value={formData.orientation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="squarish">Square</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={(useSdk ? sdkLoading : loading) || !formData.query.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {useSdk ? 
                (sdkLoading ? "Searching with SDK..." : "Search with SDK") :
                (loading ? "Searching..." : "Search with API Route")
              }
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
              Search Results ({useSdk ? "SDK" : "API Route"}):
            </h3>

            {/* SDK Results */}
            {useSdk && (
              <>
                {sdkLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <p className="text-blue-800">Searching Unsplash with SDK...</p>
                  </div>
                )}

                {sdkError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-red-800">SDK Error: {sdkError}</p>
                    {sdkError.includes("access token") && (
                      <p className="text-sm mt-2">Make sure to set NEXT_PUBLIC_UNSPLASH_ACCESS_KEY in your .env.local file!</p>
                    )}
                  </div>
                )}

                {sdkData && sdkData.response && sdkData.response.results && sdkData.response.results.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="text-green-800 font-semibold mb-2">
                      Images Found! ({sdkData.response.results.length} images) - FREE!
                    </h4>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Query:</strong> {formData.query}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Total Results:</strong> {sdkData.response.total} images available
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Config:</strong> {formData.count} images, 
                        {formData.orientation} orientation, 
                        Source: Unsplash SDK (FREE)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {sdkData.response.results.map((photo) => (
                        <PhotoComp key={photo.id} photo={photo} />
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a
                        href={`https://unsplash.com/s/photos/${encodeURIComponent(formData.query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        View on Unsplash
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* API Route Results */}
            {!useSdk && (
              <>
                {loading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <p className="text-blue-800">Searching Unsplash for images...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-red-800">Error: {JSON.stringify(error)}</p>
                  </div>
                )}

                {value?.images && value.images.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="text-green-800 font-semibold mb-2">
                      Images Found! ({value.count} images) - FREE!
                    </h4>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Query:</strong> {value.query}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Total Results:</strong> {value.totalResults} images available
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Config:</strong> {value.config.count} images, 
                        {value.config.orientation} orientation, 
                        Source: {value.config.source} ({value.config.cost})
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {value.images.map((image, index) => (
                        <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3 bg-gray-50">
                            <p className="text-xs text-gray-600 font-semibold mb-1">
                              Photo {image.id}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {image.width} × {image.height}
                            </p>
                            <p className="text-xs text-blue-600 mb-1">
                              By: <a href={image.photographerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {image.photographer}
                              </a>
                            </p>
                            <div className="flex gap-1 flex-wrap">
                              {image.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span key={tagIndex} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          // Download all images (you can implement this later)
                          alert("Download feature coming soon!");
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Download All Images
                      </button>
                      <a
                        href={`https://unsplash.com/s/photos/${encodeURIComponent(value.query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        View on Unsplash
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Quick Search Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Quick Search Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "nature landscape",
              "technology workspace",
              "food cooking",
              "travel adventure",
              "business meeting",
              "fitness workout",
              "art creative",
              "architecture modern",
              "fashion style",
              "music concert"
            ].map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  handleReset();
                  setShowResult(false);
                  setSearchRequested(false);
                  setSdkData(null);
                  setSdkError(null);
                  // Set the query and submit
                  setTimeout(() => {
                    const newFormData = { ...INITIAL_FORM_DATA, query };
                    Object.keys(newFormData).forEach(key => {
                      const event = { target: { name: key, value: newFormData[key] } };
                      handleInputChange(event);
                    });
                    if (useSdk) {
                      searchWithSdk();
                    } else {
                      setSearchRequested(true);
                    }
                    setShowResult(true);
                  }, 100);
                }}
                className="p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 text-sm"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
