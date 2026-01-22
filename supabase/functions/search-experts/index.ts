import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Anthropic from "npm:@anthropic-ai/sdk@0.32.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchParams {
  query: string;
  caseDescription?: string;
  specialty?: string;
  location?: string;
  availability?: string;
}

interface ExtractedCaseInfo {
  coreConflict: string;
  expertiseNeeded: string[];
  caseType: string;
  jurisdiction?: string;
  keyIssues: string[];
  suggestedSpecialties: string[];
}

async function extractCaseInfo(caseDescription: string): Promise<ExtractedCaseInfo | null> {
  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      console.warn("ANTHROPIC_API_KEY not configured, skipping AI extraction");
      return null;
    }

    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Analyze this legal case description and extract key information for finding expert witnesses. Return ONLY valid JSON with this structure:
{
  "coreConflict": "brief description of the main legal issue",
  "expertiseNeeded": ["list of specific expertise areas needed"],
  "caseType": "type of case (e.g., medical malpractice, construction defect)",
  "jurisdiction": "location if mentioned",
  "keyIssues": ["list of specific technical or factual issues"],
  "suggestedSpecialties": ["expert witness specialties that would be relevant"]
}

Case description:
${caseDescription}`
      }]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting case info:", error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, caseDescription, specialty, location, availability }: SearchParams = await req.json();

    if (!query || query.trim() === '') {
      if (!caseDescription || caseDescription.trim() === '') {
        return new Response(
          JSON.stringify({
            error: "Search query or case description is required"
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    let enhancedQuery = query;
    let extractedInfo: ExtractedCaseInfo | null = null;

    if (caseDescription && caseDescription.trim() !== '') {
      extractedInfo = await extractCaseInfo(caseDescription);

      if (extractedInfo) {
        const searchTerms = [
          extractedInfo.coreConflict,
          ...extractedInfo.expertiseNeeded,
          ...extractedInfo.keyIssues,
          ...extractedInfo.suggestedSpecialties
        ].filter(Boolean).join(' ');

        enhancedQuery = query ? `${query} ${searchTerms}` : searchTerms;

        console.log('AI extracted case info:', extractedInfo);
        console.log('Enhanced query:', enhancedQuery);
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let dbQuery = supabase
      .from('experts')
      .select('*')
      .eq('is_active', true);

    if (enhancedQuery && enhancedQuery.trim() !== '') {
      dbQuery = dbQuery.or(
        `full_name.ilike.%${enhancedQuery}%,specialization.ilike.%${enhancedQuery}%,bio.ilike.%${enhancedQuery}%,location.ilike.%${enhancedQuery}%`
      );
    }

    if (specialty && specialty !== 'All Specialties') {
      dbQuery = dbQuery.ilike('specialization', `%${specialty}%`);
    } else if (extractedInfo && extractedInfo.suggestedSpecialties.length > 0) {
      const specialtyConditions = extractedInfo.suggestedSpecialties
        .map(s => `specialization.ilike.%${s}%`)
        .join(',');
      if (specialtyConditions) {
        dbQuery = dbQuery.or(specialtyConditions);
      }
    }

    if (location && location.trim() !== '') {
      dbQuery = dbQuery.ilike('location', `%${location}%`);
    } else if (extractedInfo?.jurisdiction) {
      dbQuery = dbQuery.ilike('location', `%${extractedInfo.jurisdiction}%`);
    }

    dbQuery = dbQuery.order('rating', { ascending: false }).limit(20);

    const { data: expertsData, error: dbError } = await dbQuery;

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    const experts = (expertsData || []).map((expert: any) => ({
      id: expert.id,
      name: expert.full_name,
      specialty: expert.specialization,
      category: expert.specialization,
      description: expert.bio || 'Professional expert witness with extensive experience.',
      location: expert.location || 'United States',
      experience: `${expert.years_of_experience} years`,
      rate: `$${expert.hourly_rate}/hr`,
      rating: expert.rating || 0,
      reviews: expert.review_count || 0,
      caseCount: expert.case_count || 0,
      languages: expert.languages || ['English'],
      certifications: expert.certifications || [],
      education: expert.education || [],
      availability: expert.is_active ? 'Available' : 'Unavailable',
      availabilityColor: expert.is_active ? 'green' : 'gray',
      contactStatus: expert.contact_status || 'red',
      contactEmail: expert.contact_email,
      contactPhone: expert.contact_phone,
      linkedinUrl: expert.linkedin_url,
      profileUrl: expert.profile_url,
      tags: [
        expert.specialization,
        `${expert.case_count || 0}+ Cases`,
        `${expert.years_of_experience} Years`,
      ],
    }));

    return new Response(
      JSON.stringify({
        query: enhancedQuery,
        originalQuery: query,
        caseAnalysis: extractedInfo,
        total: experts.length,
        experts,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Search failed',
        experts: []
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
