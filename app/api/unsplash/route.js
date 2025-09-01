export async function POST(request) {
  try {
    const { query, count = 4, orientation = "landscape" } = await request.json();
    
    // Build the Unsplash API URL
    const baseUrl = 'https://api.unsplash.com/search/photos';
    const params = new URLSearchParams({
      query: query,
      per_page: Math.min(Math.max(count, 1), 30), // Unsplash allows 1-30 per request
      orientation: orientation, // landscape, portrait, squarish
      order_by: 'relevant' // relevant, latest
    });

    const url = `${baseUrl}?${params}`;

    // Make request to Unsplash API
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_API_KEY}`,
        'Accept-Version': 'v1'
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process the images
    const images = data.results.map((photo, index) => ({
      id: index + 1,
      unsplashId: photo.id,
      url: photo.urls.regular, // Medium quality image
      urlFull: photo.urls.full, // Full quality image
      urlThumb: photo.urls.thumb, // Thumbnail
      width: photo.width,
      height: photo.height,
      alt: photo.alt_description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadUrl: photo.links.download,
      description: photo.description || photo.alt_description || query,
      tags: photo.tags?.map(tag => tag.title) || []
    }));

    return Response.json({ 
      success: true, 
      images: images,
      count: images.length,
      query: query,
      totalResults: data.total,
      totalPages: data.total_pages,
      config: {
        count,
        orientation,
        source: 'Unsplash',
        cost: 'FREE (with attribution)'
      }
    });

  } catch (error) {
    console.error('Unsplash API Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// GET method to check if the service is available
export async function GET() {
  try {
    const keyValidation = apiKeyCheck(process.env.UNSPLASH_API_KEY);
    if (keyValidation) {
      return keyValidation;
    }
    
    return Response.json({ 
      success: true, 
      message: "Unsplash API service is available",
      source: "Unsplash",
      pricing: "FREE (with attribution)",
      supportedOrientations: ["landscape", "portrait", "squarish"],
      maxImagesPerRequest: 30,
      note: "Images are free to use with proper attribution to photographers"
    });
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
