import Exa from "npm:exa-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchRequest {
  query: string;
  numResults?: number;
  useAutoprompt?: boolean;
  extractContacts?: boolean;
}

interface ContactInfo {
  emails: string[];
  phones: string[];
  websites: string[];
}

function extractContactInfo(text: string): ContactInfo {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g;
  const websiteRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

  const emails = [...new Set((text.match(emailRegex) || []).filter(email =>
    !email.includes('example.com') &&
    !email.includes('domain.com') &&
    !email.includes('test.com')
  ))];

  const phones = [...new Set((text.match(phoneRegex) || []).filter(phone =>
    phone.replace(/\D/g, '').length >= 10
  ))];

  const websites = [...new Set((text.match(websiteRegex) || []))];

  return { emails, phones, websites };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, numResults = 10, useAutoprompt = true, extractContacts = false }: SearchRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const exaApiKey = Deno.env.get("EXA_API_KEY");

    if (!exaApiKey) {
      console.error("EXA_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          error: "Exa API key not configured. Please add EXA_API_KEY to your Supabase project secrets.",
          details: "Visit your Supabase project settings > Edge Functions > Add Secret"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const exa = new Exa(exaApiKey);

    const searchResults = await exa.searchAndContents(query, {
      numResults,
      useAutoprompt,
      highlights: true,
      text: true,
    });

    if (extractContacts && searchResults.results) {
      searchResults.results = searchResults.results.map((result: any) => {
        const textContent = result.text || '';
        const highlightsContent = (result.highlights || []).join(' ');
        const combinedText = `${textContent} ${highlightsContent}`;

        const contactInfo = extractContactInfo(combinedText);

        return {
          ...result,
          contactInfo,
        };
      });
    }

    console.log('Exa search completed:', {
      query,
      numResults: searchResults.results?.length || 0,
      autopromptString: searchResults.autopromptString,
      contactsExtracted: extractContacts
    });

    return new Response(
      JSON.stringify(searchResults),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in exa-search function:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
