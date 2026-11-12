import { HomepageSection, HomepageSectionItem, BuiltinSectionType, CustomSectionTemplate, HomepageRevisionMetadata, CachedHomepagePayload } from '../types/homepageCms';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/safeLocalStorage';
import { extractYouTubeId } from './mediaService';
import { PUBLISHED_HOMEPAGE_SECTIONS, PUBLISHED_HOMEPAGE_REVISION } from '../data/publishedHomepageSnapshot';

export const HOMEPAGE_CACHE_KEY = 'sunviloz_homepage_sections_v7';
export const HOMEPAGE_CMS_EVENT = 'sunviloz_homepage_sections_changed';
const BUCKET_NAME = 'site-media';
const CONFIG_FOLDER = 'config';

// Authoritative default homepage sections matching published production data
export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = PUBLISHED_HOMEPAGE_SECTIONS;
export const DEFAULT_HOMEPAGE_REVISION: HomepageRevisionMetadata = PUBLISHED_HOMEPAGE_REVISION;

// In-flight promise cache to prevent simultaneous duplicate requests to Supabase
let activeSectionsFetchPromise: Promise<{ sections: HomepageSection[]; revision: HomepageRevisionMetadata }> | null = null;

function notifyHomepageCms(revision?: HomepageRevisionMetadata, sections?: HomepageSection[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HOMEPAGE_CMS_EVENT, {
      detail: { revision, sections }
    }));
  }
}

/**
 * Check if a URL refers to an obsolete demo or placeholder asset.
 * Genuine production assets from Supabase or YouTube are permitted.
 */
export function isDemoMedia(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('unsplash.com') ||
    lower.includes('/assets/aistudio/') ||
    lower.includes('placeholder') ||
    lower.includes('spwatertankcleaner.com') ||
    lower.includes('/videos/tank-cleaning') ||
    lower.includes('scmzivxbsi4')
  );
}

/**
 * Sanitize a homepage section:
 * Removes any references to demo images, Unsplash, /assets/aistudio/, legacy placeholder videos.
 * Strictly preserves administrator-configured media without substituting hardcoded video or poster fallbacks.
 * If media is missing, preserves undefined/empty state so the UI displays neutral container states.
 */
export function sanitizeHomepageSection(d: any): HomepageSection {
  const isHero = d.section_key === 'hero' || d.sectionKey === 'hero' || d.id === 'sec-hero' || d.id === 'hero';

  let videoUrl = d.video_url || d.videoUrl || d.settings?.video1Url || d.content?.video1Url;
  let mobileVideoUrl = d.mobile_video_url || d.mobileVideoUrl || d.settings?.video2Url || d.content?.video2Url;
  let video2Url = d.settings?.video2Url || d.content?.video2Url || d.video2Url || d.mobile_video_url;
  let video3Url = d.settings?.video3Url || d.content?.video3Url || d.video3Url;
  let posterImageUrl = d.poster_image_url || d.posterImageUrl || d.settings?.posterImage1Url;
  let posterImage2Url = d.settings?.posterImage2Url || d.content?.posterImage2Url || d.posterImage2Url;
  let posterImage3Url = d.settings?.posterImage3Url || d.content?.posterImage3Url || d.posterImage3Url;
  let imageUrl = d.image_url || d.imageUrl;

  // Normalise empty or demo media without substituting any artificial fallback
  if (isDemoMedia(videoUrl) || !videoUrl || (typeof videoUrl === 'string' && !videoUrl.trim())) videoUrl = undefined;
  if (isDemoMedia(video2Url) || !video2Url || (typeof video2Url === 'string' && !video2Url.trim())) video2Url = undefined;
  if (isDemoMedia(mobileVideoUrl) || !mobileVideoUrl || (typeof mobileVideoUrl === 'string' && !mobileVideoUrl.trim())) mobileVideoUrl = undefined;
  if (isDemoMedia(video3Url) || !video3Url || (typeof video3Url === 'string' && !video3Url.trim())) video3Url = undefined;
  if (isDemoMedia(posterImageUrl) || !posterImageUrl || (typeof posterImageUrl === 'string' && !posterImageUrl.trim())) posterImageUrl = undefined;
  if (isDemoMedia(posterImage2Url) || !posterImage2Url || (typeof posterImage2Url === 'string' && !posterImage2Url.trim())) posterImage2Url = undefined;
  if (isDemoMedia(posterImage3Url) || !posterImage3Url || (typeof posterImage3Url === 'string' && !posterImage3Url.trim())) posterImage3Url = undefined;
  if (isDemoMedia(imageUrl) || !imageUrl || (typeof imageUrl === 'string' && !imageUrl.trim())) imageUrl = undefined;

  // Deep-clean settings and content
  const cleanSettings = { ...(d.settings || {}) };
  const cleanContent = { ...(d.content || {}) };

  if (isHero) {
    if (cleanSettings.hero) {
      cleanSettings.hero = {
        ...cleanSettings.hero,
        videoUrl,
        video2Url,
        mobileVideoUrl,
        video3Url,
        mobileVideo2Url: video2Url,
        mobileVideo3Url: video3Url,
        posterImageUrl,
        posterImage2Url,
        posterImage3Url,
        bgImageUrl: posterImageUrl
      };
    }
    if (cleanSettings.siteImages) {
      cleanSettings.siteImages = {
        ...cleanSettings.siteImages,
        heroBg: posterImageUrl,
        heroPoster: posterImageUrl
      };
    }
    cleanContent.video1Url = videoUrl;
    cleanContent.video2Url = video2Url;
    cleanContent.video3Url = video3Url;
    cleanContent.mobileVideoUrl = mobileVideoUrl;
    cleanContent.posterImage1Url = posterImageUrl;
    cleanContent.posterImage2Url = posterImage2Url;
    cleanContent.posterImage3Url = posterImage3Url;
    if (cleanContent.siteImages) {
      cleanContent.siteImages = {
        ...cleanContent.siteImages,
        heroBg: posterImageUrl,
        heroPoster: posterImageUrl
      };
    }
  }

  // Recursive string sanitizer for settings and content: purges demo strings to undefined
  const purgeDemoStrings = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(purgeDemoStrings);
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') {
        if (isDemoMedia(v)) {
          result[k] = undefined;
        } else {
          result[k] = v;
        }
      } else if (typeof v === 'object' && v !== null) {
        result[k] = purgeDemoStrings(v);
      } else {
        result[k] = v;
      }
    }
    return result;
  };

  const ytId1 = videoUrl ? extractYouTubeId(videoUrl) : null;

  return {
    id: d.id,
    sectionKey: d.section_key || d.sectionKey,
    sectionType: (d.section_type || d.sectionType) as BuiltinSectionType,
    title: d.title,
    titleBn: d.title_bn || d.titleBn,
    subtitle: d.subtitle,
    subtitleBn: d.subtitle_bn || d.subtitleBn,
    description: d.description,
    descriptionBn: d.description_bn || d.descriptionBn,
    badge: d.badge,
    badgeBn: d.badge_bn || d.badgeBn,
    mediaType: isHero ? (ytId1 ? 'youtube' : (videoUrl ? 'video' : 'none')) : (ytId1 ? 'youtube' : (d.media_type || d.mediaType || 'none')),
    imageUrl,
    videoUrl,
    mobileVideoUrl,
    video2Url,
    video3Url,
    posterImageUrl,
    posterImage2Url,
    posterImage3Url,
    youtubeUrl: ytId1 ? videoUrl : (d.youtube_url || d.youtubeUrl || null),
    youtubeVideoId: ytId1 || d.youtube_video_id || d.youtubeVideoId || null,
    buttonText: d.button_text || d.buttonText,
    buttonTextBn: d.button_text_bn || d.buttonTextBn,
    buttonUrl: d.button_url || d.buttonUrl,
    buttonIcon: d.button_icon || d.buttonIcon,
    buttonEvent: d.button_event || d.buttonEvent,
    secondaryButtonText: d.secondary_button_text || d.secondaryButtonText,
    secondaryButtonTextBn: d.secondary_button_text_bn || d.secondaryButtonTextBn,
    secondaryButtonUrl: d.secondary_button_url || d.secondaryButtonUrl,
    secondaryButtonEvent: d.secondary_button_event || d.secondaryButtonEvent,
    content: purgeDemoStrings(cleanContent),
    settings: purgeDemoStrings(cleanSettings),
    isEnabled: Boolean(d.is_enabled ?? d.isEnabled ?? true),
    sortOrder: Number(d.sort_order ?? d.sortOrder ?? 1),
    status: d.status || 'published',
    createdAt: d.created_at || d.createdAt,
    updatedAt: d.updated_at || d.updatedAt
  };
}

/**
 * Retrieve cached homepage payload with validated revision.
 * Automatically purges stale or corrupted cache entries.
 */
export function getStoredHomepagePayload(): CachedHomepagePayload | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = safeGetItem(HOMEPAGE_CACHE_KEY);
    if (!raw) return null;

    // Reject any cache containing legacy demo or unsplash artifacts
    if (
      raw.includes('/assets/aistudio/') ||
      raw.includes('images.unsplash.com') ||
      raw.includes('spwatertankcleaner.com') ||
      raw.includes('/videos/tank-cleaning') ||
      raw.includes('ScMzIvxBSi4')
    ) {
      safeRemoveItem(HOMEPAGE_CACHE_KEY);
      return null;
    }

    const parsed = JSON.parse(raw);

    // Format: Versioned payload with structured revision
    if (
      parsed && 
      parsed.revision && 
      typeof parsed.revision.version === 'number' &&
      Array.isArray(parsed.sections)
    ) {
      return {
        revision: parsed.revision,
        sections: parsed.sections.map(sanitizeHomepageSection),
        cachedAt: Number(parsed.cachedAt || Date.now())
      };
    }
  } catch {
    safeRemoveItem(HOMEPAGE_CACHE_KEY);
  }

  return null;
}

/**
 * Fetch authoritative Homepage Sections and persistent, monotonic Revision Metadata.
 * Implements in-flight request deduplication to prevent duplicate Supabase network requests.
 * Crucially: NEVER increments revision on read. Revision changes only after successful admin publishing.
 */
export async function getHomepageSectionsWithRevision(): Promise<{
  sections: HomepageSection[];
  revision: HomepageRevisionMetadata;
}> {
  // If a fetch is already in flight, await and share the existing promise
  if (activeSectionsFetchPromise) {
    return activeSectionsFetchPromise;
  }

  activeSectionsFetchPromise = (async () => {
    let sections: HomepageSection[] = DEFAULT_HOMEPAGE_SECTIONS;
    let revision: HomepageRevisionMetadata = DEFAULT_HOMEPAGE_REVISION;

    // Check SSR / window hydration snapshot
    if (typeof window !== 'undefined') {
      const windowSnapshot = (window as any).__INITIAL_HOMEPAGE_SECTIONS__;
      const windowRev = (window as any).__HOMEPAGE_REVISION__;
      if (Array.isArray(windowSnapshot) && windowSnapshot.length > 0) {
        sections = windowSnapshot.map(sanitizeHomepageSection);
        if (windowRev && typeof windowRev.version === 'number') {
          revision = windowRev;
        }
      } else {
        const cachedPayload = getStoredHomepagePayload();
        if (cachedPayload && cachedPayload.sections.length > 0) {
          sections = cachedPayload.sections;
          revision = cachedPayload.revision;
        }
      }
    }

    // Fetch authoritative data from Supabase Database
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const freshSections = data.map(sanitizeHomepageSection).sort((a, b) => a.sortOrder - b.sortOrder);

          // Extract database-backed persistent revision from sec-hero row
          const heroRow = data.find(r => r.id === 'sec-hero' || r.section_key === 'hero') || data[0];
          const storedRev = heroRow?.content?.revision || heroRow?.settings?.revision;

          let resolvedRevision: HomepageRevisionMetadata;

          if (storedRev && typeof storedRev.version === 'number' && storedRev.revisionId) {
            resolvedRevision = {
              revisionId: storedRev.revisionId,
              version: storedRev.version,
              publishedAt: storedRev.publishedAt || heroRow.updated_at || new Date().toISOString(),
              publishedBy: storedRev.publishedBy || 'administrator',
              source: 'database'
            };
          } else {
            // Stable baseline revision derived from database timestamp (NEVER increments on read!)
            const latestTimestamp = new Date(heroRow?.updated_at || 0).getTime() || 1794503818912;
            resolvedRevision = {
              revisionId: `rev_${latestTimestamp}`,
              version: 12, // STABLE MONOTONIC BASELINE (constant on reads)
              publishedAt: new Date(latestTimestamp).toISOString(),
              publishedBy: 'supabase_database',
              source: 'database'
            };
          }

          if (typeof window !== 'undefined') {
            const cachePayload: CachedHomepagePayload = {
              revision: resolvedRevision,
              sections: freshSections,
              cachedAt: Date.now()
            };
            safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify(cachePayload));
          }

          return { sections: freshSections, revision: resolvedRevision };
        }
      } catch (err) {
        console.warn('[HomepageCmsService] Supabase database query notice:', err);
      }

      // Fallback: Query published JSON snapshot from Supabase Storage config folder
      try {
        const { data: pubData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${CONFIG_FOLDER}/homepage_sections_published.json`);

        if (pubData?.publicUrl) {
          const res = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          });

          if (res.ok) {
            const remoteJson = await res.json();
            let remoteSections: any[] = [];
            let remoteRev: HomepageRevisionMetadata = revision;

            if (Array.isArray(remoteJson)) {
              remoteSections = remoteJson;
            } else if (remoteJson && Array.isArray(remoteJson.sections)) {
              remoteSections = remoteJson.sections;
              if (remoteJson.revision && typeof remoteJson.revision.version === 'number') {
                remoteRev = {
                  ...remoteJson.revision,
                  source: 'storage_config'
                };
              }
            }

            if (remoteSections.length > 0) {
              const freshSections = remoteSections.map(sanitizeHomepageSection).sort((a, b) => a.sortOrder - b.sortOrder);
              if (typeof window !== 'undefined') {
                safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify({
                  revision: remoteRev,
                  sections: freshSections,
                  cachedAt: Date.now()
                }));
              }
              return { sections: freshSections, revision: remoteRev };
            }
          }
        }
      } catch (storageErr) {
        console.warn('[HomepageCmsService] Supabase storage published json query notice:', storageErr);
      }
    }

    return { sections, revision };
  })().finally(() => {
    activeSectionsFetchPromise = null;
  });

  return activeSectionsFetchPromise;
}

/**
 * Fetch all Homepage Sections (convenience wrapper returning sections array)
 */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  const result = await getHomepageSectionsWithRevision();
  return result.sections;
}

/**
 * Save single or updated section to Supabase.
 * Strictly guarantees that:
 * 1. Database operation is executed FIRST.
 * 2. If database operation fails, NO local cache update is made and false is returned.
 * 3. On success, a new persistent monotonic revision (version + 1) is created and stored in Supabase.
 * 4. Local cache is updated with the new revision and published events are broadcasted.
 */
export async function saveHomepageSection(section: HomepageSection): Promise<boolean> {
  const isHero = section.sectionKey === 'hero' || section.id === 'hero' || section.id === 'sec-hero';
  const targetId = isHero ? 'sec-hero' : section.id;

  if (!isSupabaseConfigured()) {
    console.warn('[HomepageCmsService] Supabase is not configured. Operation aborted.');
    return false;
  }

  try {
    const currentData = await getHomepageSectionsWithRevision();
    const currentSections = currentData.sections;
    const currentVersion = currentData.revision.version || 11;

    // Calculate persistent, monotonic incremented version
    const nextVersion = currentVersion + 1;
    const publishedTimestamp = new Date().toISOString();
    const newRevision: HomepageRevisionMetadata = {
      revisionId: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      version: nextVersion,
      publishedAt: publishedTimestamp,
      publishedBy: 'administrator',
      source: 'database'
    };

    const exists = currentSections.some(s => s.id === targetId || (isHero && s.sectionKey === 'hero'));
    const updatedSection: HomepageSection = {
      ...section,
      id: targetId,
      sectionKey: isHero ? 'hero' : section.sectionKey,
      updatedAt: publishedTimestamp
    };

    const v1 = updatedSection.videoUrl || null;
    const v2 = updatedSection.video2Url || updatedSection.mobileVideoUrl || null;
    const v3 = updatedSection.video3Url || null;
    const p1 = updatedSection.posterImageUrl || null;
    const p2 = updatedSection.posterImage2Url || null;
    const p3 = updatedSection.posterImage3Url || null;

    const ytId1 = v1 ? extractYouTubeId(v1) : null;

    const sectionSettings = {
      ...(updatedSection.settings || {}),
      video1Url: v1,
      video2Url: v2,
      video3Url: v3,
      mobileVideoUrl: v2,
      posterImage1Url: p1,
      posterImage2Url: p2,
      posterImage3Url: p3,
      revision: newRevision
    };

    const sectionContent = {
      ...(updatedSection.content || {}),
      video1Url: v1,
      video2Url: v2,
      video3Url: v3,
      mobileVideoUrl: v2,
      posterImage1Url: p1,
      posterImage2Url: p2,
      posterImage3Url: p3,
      revision: newRevision
    };

    const payload = {
      id: targetId,
      section_key: updatedSection.sectionKey,
      section_type: updatedSection.sectionType,
      title: updatedSection.title || null,
      title_bn: updatedSection.titleBn || null,
      subtitle: updatedSection.subtitle || null,
      subtitle_bn: updatedSection.subtitleBn || null,
      description: updatedSection.description || null,
      description_bn: updatedSection.descriptionBn || null,
      badge: updatedSection.badge || null,
      badge_bn: updatedSection.badgeBn || null,
      media_type: ytId1 ? 'youtube' : (v1 ? 'video' : (updatedSection.mediaType || 'none')),
      image_url: updatedSection.imageUrl || null,
      video_url: v1,
      mobile_video_url: v2,
      poster_image_url: p1,
      youtube_url: ytId1 ? v1 : (updatedSection.youtubeUrl || null),
      youtube_video_id: ytId1 || updatedSection.youtubeVideoId || null,
      button_text: updatedSection.buttonText || null,
      button_text_bn: updatedSection.buttonTextBn || null,
      button_url: updatedSection.buttonUrl || null,
      button_icon: updatedSection.buttonIcon || null,
      button_event: updatedSection.buttonEvent || null,
      secondary_button_text: updatedSection.secondaryButtonText || null,
      secondary_button_text_bn: updatedSection.secondaryButtonTextBn || null,
      secondary_button_url: updatedSection.secondaryButtonUrl || null,
      secondary_button_event: updatedSection.secondaryButtonEvent || null,
      content: sectionContent,
      settings: sectionSettings,
      is_enabled: updatedSection.isEnabled,
      sort_order: updatedSection.sortOrder,
      status: updatedSection.status || 'published',
      updated_at: updatedSection.updatedAt
    };

    // Step 1: Execute Supabase Database update with .select() to verify affected rows
    const { data: updateData, error: updateError } = await supabase
      .from('homepage_sections')
      .update(payload)
      .eq('id', targetId)
      .select();

    let writeSucceeded = false;
    let savedRow: any = null;

    if (!updateError && Array.isArray(updateData) && updateData.length > 0) {
      writeSucceeded = true;
      savedRow = updateData[0];
    } else {
      console.warn(`[HomepageCmsService] Row ${targetId} not updated directly, performing safe upsert...`);
      const { data: upsertData, error: upsertError } = await supabase
        .from('homepage_sections')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (!upsertError && Array.isArray(upsertData) && upsertData.length > 0) {
        writeSucceeded = true;
        savedRow = upsertData[0];
      } else {
        console.error('[HomepageCmsService] Database saveHomepageSection failed on both update and upsert:', upsertError?.message || updateError?.message);
        return false;
      }
    }

    if (!writeSucceeded || !savedRow) {
      console.error('[HomepageCmsService] Database write verification failed: zero rows affected.');
      return false;
    }

    // Step 2: Strict Read-back verification: confirm media references match submitted values
    if (isHero) {
      const savedV1 = savedRow.video_url || savedRow.content?.video1Url || savedRow.settings?.video1Url;
      const savedPoster = savedRow.poster_image_url || savedRow.content?.poster1Url || savedRow.settings?.poster1Url;
      const expectedImg = updatedSection.imageUrl || null;
      const savedImg = savedRow.image_url || savedRow.content?.image || savedRow.settings?.image;

      let mismatchReason = '';
      if (v1 && savedV1 && savedV1 !== v1) {
        mismatchReason = `Hero video mismatch: expected ${v1}, database holds ${savedV1}`;
      } else if (p1 && savedPoster && savedPoster !== p1) {
        mismatchReason = `Hero poster mismatch: expected ${p1}, database holds ${savedPoster}`;
      } else if (expectedImg && savedImg && savedImg !== expectedImg) {
        mismatchReason = `Hero image mismatch: expected ${expectedImg}, database holds ${savedImg}`;
      }

      if (mismatchReason) {
        console.error(`[HomepageCmsService] Strict media verification failed: ${mismatchReason}`);
        // Attempt immediate reconciliation by re-updating with explicit overrides
        const { data: fixData, error: fixErr } = await supabase
          .from('homepage_sections')
          .update({
            video_url: v1,
            poster_image_url: p1,
            image_url: expectedImg,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetId)
          .select();

        const fixedV1 = fixData?.[0]?.video_url;
        if (fixErr || (v1 && fixedV1 && fixedV1 !== v1)) {
          console.error('[HomepageCmsService] Media reconciliation failed. Aborting partial publication.');
          return false;
        }
      }
    }

    const updatedList = exists
      ? currentSections.map(s => (s.id === targetId || (isHero && s.sectionKey === 'hero')) ? updatedSection : s)
      : [...currentSections, updatedSection];

    const sanitizedList = updatedList.map(sanitizeHomepageSection).sort((a, b) => a.sortOrder - b.sortOrder);

    // Step 3: Persist published snapshot & revision metadata to Supabase Storage config folder
    const storagePayload = {
      revision: newRevision,
      sections: sanitizedList,
      publishedAt: newRevision.publishedAt
    };
    const payloadString = JSON.stringify(storagePayload, null, 2);

    const { error: storeSecErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${CONFIG_FOLDER}/homepage_sections_published.json`, new Blob([payloadString], { type: 'application/json' }), {
        cacheControl: '0',
        upsert: true,
        contentType: 'application/json'
      });

    if (storeSecErr) {
      console.error('[HomepageCmsService] Storage published snapshot upload failed:', storeSecErr.message);
      return false;
    }

    const { error: storeRevErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${CONFIG_FOLDER}/homepage_revision.json`, new Blob([JSON.stringify(newRevision, null, 2)], { type: 'application/json' }), {
        cacheControl: '0',
        upsert: true,
        contentType: 'application/json'
      });

    if (storeRevErr) {
      console.error('[HomepageCmsService] Storage revision upload failed:', storeRevErr.message);
      return false;
    }

    // Step 3: Update local cache with validated monotonic revision
    if (typeof window !== 'undefined') {
      const cachePayload: CachedHomepagePayload = {
        revision: newRevision,
        sections: sanitizedList,
        cachedAt: Date.now()
      };
      safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify(cachePayload));
    }

    // Step 4: Broadcast update event
    notifyHomepageCms(newRevision, sanitizedList);

    return true;
  } catch (err) {
    console.error('[HomepageCmsService] Failed to save homepage section:', err);
    return false;
  }
}

/**
 * Reorder sections and save new sort order in Supabase.
 * Generates an incremented monotonic revision only upon confirmed database commit.
 */
export async function reorderHomepageSections(sections: HomepageSection[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const publishedTimestamp = new Date().toISOString();
  const normalized = sections.map((sec, idx) => ({
    ...sec,
    sortOrder: idx + 1,
    updatedAt: publishedTimestamp
  }));

  try {
    const currentData = await getHomepageSectionsWithRevision();
    const nextVersion = (currentData.revision.version || 11) + 1;
    const newRevision: HomepageRevisionMetadata = {
      revisionId: `rev_${Date.now()}_reorder`,
      version: nextVersion,
      publishedAt: publishedTimestamp,
      publishedBy: 'administrator',
      source: 'database'
    };

    const updates = normalized.map(sec => ({
      id: sec.id,
      section_key: sec.sectionKey,
      section_type: sec.sectionType,
      sort_order: sec.sortOrder,
      is_enabled: sec.isEnabled,
      status: sec.status,
      updated_at: sec.updatedAt
    }));

    const { error } = await supabase
      .from('homepage_sections')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('[HomepageCmsService] Supabase reorderHomepageSections error:', error);
      return false;
    }

    const sanitizedList = normalized.map(sanitizeHomepageSection).sort((a, b) => a.sortOrder - b.sortOrder);

    // Persist to storage
    try {
      const storagePayload = {
        revision: newRevision,
        sections: sanitizedList,
        publishedAt: newRevision.publishedAt
      };
      await supabase.storage
        .from(BUCKET_NAME)
        .upload(`${CONFIG_FOLDER}/homepage_sections_published.json`, new Blob([JSON.stringify(storagePayload, null, 2)], { type: 'application/json' }), {
          cacheControl: '0',
          upsert: true,
          contentType: 'application/json'
        });
    } catch {}

    // Update local cache
    if (typeof window !== 'undefined') {
      safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify({
        revision: newRevision,
        sections: sanitizedList,
        cachedAt: Date.now()
      }));
    }

    notifyHomepageCms(newRevision, sanitizedList);
    return true;
  } catch (err) {
    console.error('[HomepageCmsService] Failed to reorder sections in Supabase:', err);
    return false;
  }
}

/**
 * Delete a section from Supabase and generate an incremented revision upon confirmation.
 */
export async function deleteHomepageSection(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const currentData = await getHomepageSectionsWithRevision();
    const filtered = currentData.sections.filter(s => s.id !== id);

    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[HomepageCmsService] Supabase deleteHomepageSection error:', error);
      return false;
    }

    const nextVersion = (currentData.revision.version || 11) + 1;
    const newRevision: HomepageRevisionMetadata = {
      revisionId: `rev_${Date.now()}_delete`,
      version: nextVersion,
      publishedAt: new Date().toISOString(),
      publishedBy: 'administrator',
      source: 'database'
    };

    if (typeof window !== 'undefined') {
      safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify({
        revision: newRevision,
        sections: filtered,
        cachedAt: Date.now()
      }));
    }

    notifyHomepageCms(newRevision, filtered);
    return true;
  } catch (err) {
    console.error('[HomepageCmsService] Failed to delete section in Supabase:', err);
    return false;
  }
}

/**
 * Duplicate a section
 */
export async function duplicateHomepageSection(section: HomepageSection): Promise<HomepageSection> {
  const current = await getHomepageSections();
  const newId = `sec-custom-${Date.now()}`;
  const newKey = `custom_${Date.now()}`;
  const maxOrder = Math.max(...current.map(s => s.sortOrder), 0);

  const duplicated: HomepageSection = {
    ...section,
    id: newId,
    sectionKey: newKey,
    title: `${section.title || 'Section'} (Copy)`,
    titleBn: `${section.titleBn || 'সেকশন'} (কপি)`,
    sortOrder: maxOrder + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveHomepageSection(duplicated);
  return duplicated;
}

/**
 * Add a new Custom Section with a clean template (zero demo/sample video IDs)
 */
export async function createCustomSection(
  template: CustomSectionTemplate,
  titleBn: string,
  titleEn: string
): Promise<HomepageSection> {
  const current = await getHomepageSections();
  const newId = `sec-custom-${Date.now()}`;
  const newKey = `custom_${Date.now()}`;
  const maxOrder = Math.max(...current.map(s => s.sortOrder), 0);

  const newSec: HomepageSection = {
    id: newId,
    sectionKey: newKey,
    sectionType: 'custom',
    title: titleEn,
    titleBn: titleBn,
    subtitle: 'Tailored hygiene and maintenance solutions',
    subtitleBn: 'বিশেষায়িত ওয়াটার ট্যাংক ও স্বাস্থ্যসেবা',
    description: 'Customized solutions for residential and commercial water reservoirs in Dhaka.',
    descriptionBn: 'ঢাকা শহরের বাসাবাড়ি ও ভবনের পানি সুরক্ষায় কাস্টমাইজড সমাধান।',
    mediaType: template === 'video' ? 'video' : template.includes('image') ? 'image' : 'none',
    imageUrl: undefined,
    youtubeUrl: undefined,
    youtubeVideoId: undefined,
    buttonText: 'Book Service',
    buttonTextBn: 'বুকিং করুন',
    buttonUrl: '#quote',
    buttonEvent: 'cta_click',
    settings: {
      customTemplate: template,
      bgStyle: template === 'banner' ? 'blue' : 'white',
      layout: template === 'two_column' ? 'split' : 'standard',
      columns: template === 'three_column' ? 3 : 2
    },
    isEnabled: true,
    sortOrder: maxOrder + 1,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveHomepageSection(newSec);
  return newSec;
}
