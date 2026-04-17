import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('supabase');

    const res = await fetch('https://api.supabase.com/v1/projects', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      return Response.json({ error: `Supabase API error: ${res.status}` }, { status: res.status });
    }

    const projects = await res.json();

    const result = projects.map(p => ({
      name: p.name,
      ref: p.ref,
      region: p.region,
      status: p.status,
      project_url: `https://${p.ref}.supabase.co`,
      created_at: p.created_at,
    }));

    return Response.json({ projects: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});