export const apiKeyCheck = (apiKey) => {
  if (!apiKey) {
    console.error("API key not configured");
    return Response.json(
      {
        success: false,
        error: "API key not configured",
      },
      { status: 500 }
    );
  }
};