/**
 * Image Background Remover - Cloudflare Worker
 * 
 * Receives image, calls Remove.bg API, returns result.
 */

const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export interface Env {
  REMOVE_BG_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Only POST method allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check API key
    if (!env.REMOVE_BG_API_KEY) {
      return new Response(JSON.stringify({ error: 'Remove.bg API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Get image from form data
      const formData = await request.formData();
      const imageFile = formData.get('image');

      if (!imageFile || !(imageFile instanceof File)) {
        return new Response(JSON.stringify({ error: 'No image file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check file size (limit to 50MB)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (imageFile.size > MAX_SIZE) {
        return new Response(JSON.stringify({ error: 'File too large (max 50MB)' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Prepare form data for Remove.bg
      const removeBgFormData = new FormData();
      removeBgFormData.append('image_file', imageFile);
      removeBgFormData.append('size', 'auto');
      removeBgFormData.append('output_format', 'png');
      removeBgFormData.append('no_shadow', 'false');
      removeBgFormData.append('crop', 'false');

      // Call Remove.bg API
      const response = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': env.REMOVE_BG_API_KEY,
        },
        body: removeBgFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Remove.bg API error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to remove background', details: errorText }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Return the result image
      const resultBuffer = await response.arrayBuffer();
      
      return new Response(resultBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store',
          'Content-Length': resultBuffer.byteLength.toString(),
        },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
