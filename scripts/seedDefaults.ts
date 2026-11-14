/**
 * Explicit one-time database seed script (RUN MANUALLY VIA: npx tsx scripts/seedDefaults.ts).
 * Never invoked on public reads or application startup so deleted/hidden items are never resurrected.
 */
import { createServerSupabaseClient } from '../src/seo/siteDataFetcher';
import { DEFAULT_SERVICE_ZONES, DEFAULT_ZONE_AREAS } from '../src/services/zoneContentService';
import { WATER_TANK_ARTICLES } from '../src/data/waterTankArticles';
import { AUTHORITATIVE_SERVICES } from '../src/services/serviceRegistry';

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required in server environment to run manual seeding.');
    process.exit(1);
  }

  const { client, configured } = createServerSupabaseClient();
  if (!configured || !client) {
    console.error('Error: Supabase URL/Key is not configured.');
    process.exit(1);
  }

  console.log('[Seed] Seeding default service_zones (insert-only on conflict ignore)...');
  const zoneRows = DEFAULT_SERVICE_ZONES.map(z => ({
    slug: z.slug,
    name_en: z.nameEn,
    name_bn: z.nameBn,
    summary_en: z.summaryEn,
    summary_bn: z.summaryBn,
    featured_slug: z.featuredSlug,
    places_text: z.placesText,
    sort_order: z.sortOrder,
    is_visible: z.isVisible,
    status: z.status,
    draft_data: z.draftData,
    published_data: z.publishedData
  }));
  await client.from('service_zones').upsert(zoneRows, { onConflict: 'slug', ignoreDuplicates: true });

  const { data: liveZones } = await client.from('service_zones').select('id, slug');
  const zoneIdBySlug = new Map((liveZones || []).map((z: any) => [z.slug, z.id]));

  console.log('[Seed] Seeding default zone_areas (insert-only on conflict ignore)...');
  const areaRows = DEFAULT_ZONE_AREAS.map(a => ({
    zone_id: zoneIdBySlug.get(a.zoneSlug) || null,
    slug: a.slug,
    area_name: a.areaName,
    area_name_bn: a.areaNameBn,
    is_core_city: a.isCoreCity,
    is_visible: a.isVisible,
    status: a.status,
    sort_order: a.sortOrder,
    draft_data: a.draftData,
    published_data: a.publishedData
  }));
  await client.from('zone_areas').upsert(areaRows, { onConflict: 'slug', ignoreDuplicates: true });

  console.log('[Seed] Seeding default services (insert-only on conflict ignore)...');
  const serviceRows = AUTHORITATIVE_SERVICES.map(s => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    title_bn: s.titleBn,
    name: s.name || s.title,
    short_desc: s.shortDesc,
    short_desc_bn: s.shortDescBn || s.shortDesc,
    full_desc: s.fullDesc || '',
    full_desc_bn: s.fullDescBn || '',
    category: s.category || 'Water Tank Cleaning',
    icon_name: s.iconName || 'Droplets',
    icon: s.icon || 'Droplets',
    image: s.image || '',
    featured_image: s.featured_image || s.image || '',
    is_active: true,
    display_order: s.display_order || 1,
    starting_price: s.startingPrice || 1500
  }));
  await client.from('services').upsert(serviceRows, { onConflict: 'id', ignoreDuplicates: true });

  console.log('[Seed] Seeding default blog_posts (insert-only on conflict ignore)...');
  const blogRows = WATER_TANK_ARTICLES.map(p => ({
    id: p.id,
    slug: p.slug,
    category: p.category,
    category_bn: p.categoryBn || p.category,
    title: p.title,
    title_bn: p.titleBn || p.title,
    excerpt: p.excerpt,
    excerpt_bn: p.excerptBn || p.excerpt,
    content: p.content,
    content_bn: p.contentBn || p.content,
    image_url: p.imageUrl || '',
    author: p.author,
    published_at: p.publishedAt,
    read_time: p.readTime,
    read_time_bn: p.readTimeBn || p.readTime,
    featured: Boolean(p.featured),
    published: p.published !== false,
    seo: p.seo || {}
  }));
  await client.from('blog_posts').upsert(blogRows, { onConflict: 'id', ignoreDuplicates: true });

  await client
    .from('site_seed_history')
    .upsert({ seed_key: 'manual_cli_seed_v1', notes: 'Seeded manually via scripts/seedDefaults.ts' }, { onConflict: 'seed_key' });

  console.log('[Seed] Done! Existing records were preserved (ignoreDuplicates=true).');
}

main().catch(err => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
