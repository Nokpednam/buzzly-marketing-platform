import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known magic byte sequences
const MAGIC_BYTES = {
  JPEG: [0xff, 0xd8, 0xff],
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

// Validates true MIME type by inspecting the file buffer
function getVerifiedMimeType(buffer: Uint8Array): string {
  // Check PNG
  if (buffer.length >= 8 && MAGIC_BYTES.PNG.every((b, i) => buffer[i] === b)) {
    return 'image/png';
  }
  // Check JPEG
  if (buffer.length >= 3 && MAGIC_BYTES.JPEG.every((b, i) => buffer[i] === b)) {
    return 'image/jpeg';
  }
  // Check SVG (text-based, typically contains <svg or <?xml)
  const textPreview = new TextDecoder().decode(buffer.slice(0, 100)).trim();
  if (textPreview.includes('<svg') || textPreview.includes('<?xml')) {
    return 'image/svg+xml';
  }
  return 'unknown';
}

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filePath = formData.get('path') as string;
    const bucket = formData.get('bucket') as string || 'avatars';
    
    if (!file || !filePath) {
      throw new Error("Missing file or path parameter.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Validate True MIME Type via Magic Bytes
    const trueMimeType = getVerifiedMimeType(buffer);
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    
    if (!validTypes.includes(trueMimeType)) {
      return new Response(
        JSON.stringify({ error: "Security risk detected: File magic bytes do not match allowed image types (jpg/png/svg)." }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to Supabase using the user's Auth token (passed in headers)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Upload verified file to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        contentType: trueMimeType, // Force the verified MIME type
        upsert: true
      });

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
