import { useState, useEffect } from 'react';
import { ProjectItem } from '../types';
import { PROJECTS_DATA } from '../data/projectsData';
import { safeGetItem, safeSetItem } from './safeLocalStorage';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'sunviloz_portfolio_projects_v4';
const EVENT_NAME = 'sunviloz_portfolio_changed';

export const INITIAL_PROJECTS: ProjectItem[] = PROJECTS_DATA;

export function slugifyCaseStudy(input: string, fallbackId?: string): string {
  const clean = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (clean.length >= 3) return clean;
  return fallbackId ? `case-${String(fallbackId).replace(/[^a-z0-9-]+/gi, '-').toLowerCase()}` : `case-${Date.now().toString(36)}`;
}

export function isPublicPublishedCaseStudy(p: Partial<ProjectItem> | null | undefined): boolean {
  if (!p) return false;
  return (p.status || 'published') === 'published' && p.customerConsentGranted === true;
}

export function readSnapshotCaseStudies(): ProjectItem[] | null {
  const globalAny = globalThis as any;
  const raw =
    globalAny.__INITIAL_CASE_STUDIES__ ??
    (typeof window !== 'undefined' ? (window as any).__INITIAL_CASE_STUDIES__ : undefined);
  if (Array.isArray(raw)) {
    return (raw as any[])
      .map(item => mapRowOrSummaryToProjectItem(item))
      .filter(isPublicPublishedCaseStudy);
  }
  return null;
}

function mapRowOrSummaryToProjectItem(d: any): ProjectItem {
  const details = d.details && typeof d.details === 'object' ? d.details : {};
  const title = String(d.title || '');
  const slug = String(d.slug || details.slug || slugifyCaseStudy(title, d.id));
  const rawStatus = d.status || details.status || 'published';
  const status: 'draft' | 'published' = rawStatus === 'draft' ? 'draft' : 'published';

  return {
    id: String(d.id),
    slug,
    title,
    titleBn: d.title_bn ?? d.titleBn ?? '',
    category: d.category || 'Rooftop',
    area: d.area || d.location || 'Dhaka',
    areaSlug: d.area_slug ?? d.areaSlug ?? details.areaSlug ?? undefined,
    location: d.location || d.area || 'Dhaka',
    locationBn: d.location_bn ?? d.locationBn ?? details.locationBn ?? '',
    tankType: d.tank_type ?? d.tankType ?? 'Overhead Tank',
    capacity: d.capacity ?? details.capacity ?? '',
    duration: d.duration ?? details.duration ?? '',
    serviceDate: d.service_date ?? d.serviceDate ?? d.completed_date ?? d.completedDate ?? '',
    completedDate: d.completed_date ?? d.completedDate ?? d.service_date ?? d.serviceDate ?? '',
    beforeImg: d.before_img ?? d.before_image ?? d.beforeImage ?? d.beforeImg ?? '',
    beforeImage: d.before_image ?? d.before_img ?? d.beforeImage ?? d.beforeImg ?? '',
    beforeCaption: d.before_caption ?? d.beforeCaption ?? details.beforeCaption ?? '',
    beforeCaptionBn: d.before_caption_bn ?? d.beforeCaptionBn ?? details.beforeCaptionBn ?? '',
    afterImg: d.after_img ?? d.after_image ?? d.afterImage ?? d.afterImg ?? '',
    afterImage: d.after_image ?? d.after_img ?? d.afterImage ?? d.afterImg ?? '',
    afterCaption: d.after_caption ?? d.afterCaption ?? details.afterCaption ?? '',
    afterCaptionBn: d.after_caption_bn ?? d.afterCaptionBn ?? details.afterCaptionBn ?? '',
    summary: d.summary ?? d.description ?? '',
    summaryBn: d.summary_bn ?? d.summaryBn ?? d.description_bn ?? d.descriptionBn ?? '',
    description: d.description ?? d.summary ?? '',
    descriptionBn: d.description_bn ?? d.descriptionBn ?? d.summary_bn ?? d.summaryBn ?? '',
    customerProblem: d.customer_problem ?? d.customerProblem ?? details.customerProblem ?? '',
    customerProblemBn: d.customer_problem_bn ?? d.customerProblemBn ?? details.customerProblemBn ?? '',
    workDone: d.work_done ?? d.workDone ?? details.workDone ?? '',
    workDoneBn: d.work_done_bn ?? d.workDoneBn ?? details.workDoneBn ?? '',
    actualResult: d.actual_result ?? d.actualResult ?? details.actualResult ?? '',
    actualResultBn: d.actual_result_bn ?? d.actualResultBn ?? details.actualResultBn ?? '',
    featured: Boolean(d.featured),
    relatedServiceSlug: d.related_service_slug ?? d.relatedServiceSlug ?? details.relatedServiceSlug ?? '',
    status,
    customerConsentGranted: d.customer_consent_granted !== undefined
      ? d.customer_consent_granted === true
      : d.customerConsentGranted === true,
    metaTitle: d.meta_title ?? d.metaTitle ?? details.metaTitle ?? '',
    metaDescription: d.meta_description ?? d.metaDescription ?? details.metaDescription ?? '',
    updatedAt: d.updated_at ?? d.updatedAt ?? undefined,
    sourceType: d.sourceType || 'company_work'
  };
}

function buildDetailsPayload(p: ProjectItem): Record<string, any> {
  return {
    slug: p.slug,
    areaSlug: p.areaSlug || '',
    status: p.status || 'draft',
    duration: p.duration || '',
    locationBn: p.locationBn || '',
    capacity: p.capacity || '',
    beforeCaption: p.beforeCaption || '',
    beforeCaptionBn: p.beforeCaptionBn || '',
    afterCaption: p.afterCaption || '',
    afterCaptionBn: p.afterCaptionBn || '',
    customerProblem: p.customerProblem || '',
    customerProblemBn: p.customerProblemBn || '',
    workDone: p.workDone || '',
    workDoneBn: p.workDoneBn || '',
    actualResult: p.actualResult || '',
    actualResultBn: p.actualResultBn || '',
    relatedServiceSlug: p.relatedServiceSlug || '',
    metaTitle: p.metaTitle || '',
    metaDescription: p.metaDescription || ''
  };
}

export async function fetchProjectsFromSupabase(
  options: { includeDrafts?: boolean } = {}
): Promise<ProjectItem[]> {
  const { includeDrafts = false } = options;

  if (typeof window === 'undefined') {
    const snap = readSnapshotCaseStudies();
    if (snap) return snap;
    return includeDrafts ? INITIAL_PROJECTS : INITIAL_PROJECTS.filter(isPublicPublishedCaseStudy);
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('service_date', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapRowOrSummaryToProjectItem);
        const publicList = mapped.filter(isPublicPublishedCaseStudy);
        (window as any).__INITIAL_CASE_STUDIES__ = publicList;
        safeSetItem(STORAGE_KEY, JSON.stringify(publicList));
        return includeDrafts ? mapped : publicList;
      }
    } catch (err) {
      console.warn('Could not load portfolio from Supabase:', err);
    }
  }

  const snap = readSnapshotCaseStudies();
  if (snap) {
    return snap;
  }

  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return includeDrafts ? parsed : parsed.filter(isPublicPublishedCaseStudy);
      }
    }
  } catch {
    // Ignore storage read failure
  }

  return includeDrafts ? INITIAL_PROJECTS : INITIAL_PROJECTS.filter(isPublicPublishedCaseStudy);
}

export const getStoredProjects = async (): Promise<ProjectItem[]> => {
  return await fetchProjectsFromSupabase({ includeDrafts: false });
};

export const getStoredProjectsSync = (): ProjectItem[] => {
  const snap = readSnapshotCaseStudies();
  if (snap) return snap;
  if (typeof window === 'undefined') return INITIAL_PROJECTS.filter(isPublicPublishedCaseStudy);
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isPublicPublishedCaseStudy);
    }
  } catch {
    // Ignore
  }
  return INITIAL_PROJECTS.filter(isPublicPublishedCaseStudy);
};

async function upsertProjectRow(p: ProjectItem): Promise<{ success: boolean; error?: string }> {
  const cleanSlug = slugifyCaseStudy(p.slug || p.title, p.id);
  const details = buildDetailsPayload({ ...p, slug: cleanSlug });
  const beforeUrl = p.beforeImage || p.beforeImg || '';
  const afterUrl = p.afterImage || p.afterImg || '';
  const summaryText = p.summary || p.description || '';
  const summaryBnText = p.summaryBn || p.descriptionBn || '';

  const basePayload: Record<string, any> = {
    id: p.id,
    title: p.title,
    title_bn: p.titleBn || null,
    category: p.category || 'Rooftop',
    area: p.area || p.location || 'Dhaka',
    location: p.location || p.area || 'Dhaka',
    location_bn: p.locationBn || null,
    tank_type: p.tankType || 'Overhead Tank',
    capacity: p.capacity || null,
    service_date: p.serviceDate || p.completedDate || null,
    completed_date: p.completedDate || p.serviceDate || null,
    before_img: beforeUrl || null,
    before_image: beforeUrl || null,
    after_img: afterUrl || null,
    after_image: afterUrl || null,
    summary: summaryText || null,
    summary_bn: summaryBnText || null,
    description: p.description || summaryText || null,
    description_bn: p.descriptionBn || summaryBnText || null,
    featured: Boolean(p.featured),
    related_service_slug: p.relatedServiceSlug || null,
    customer_consent_granted: p.customerConsentGranted === true,
    updated_at: new Date().toISOString()
  };

  const extendedPayload: Record<string, any> = {
    ...basePayload,
    slug: cleanSlug,
    area_slug: p.areaSlug || null,
    status: p.status === 'draft' ? 'draft' : 'published',
    duration: p.duration || null,
    customer_problem: p.customerProblem || null,
    customer_problem_bn: p.customerProblemBn || null,
    work_done: p.workDone || null,
    work_done_bn: p.workDoneBn || null,
    actual_result: p.actualResult || null,
    actual_result_bn: p.actualResultBn || null,
    before_caption: p.beforeCaption || null,
    before_caption_bn: p.beforeCaptionBn || null,
    after_caption: p.afterCaption || null,
    after_caption_bn: p.afterCaptionBn || null,
    meta_title: p.metaTitle || null,
    meta_description: p.metaDescription || null,
    details
  };

  const { error } = await supabase.from('portfolio_projects').upsert(extendedPayload, { onConflict: 'id' });
  if (!error) {
    return { success: true };
  }

  // Fallback gracefully if 20261116 SQL migration hasn't been applied to the Supabase project yet
  const errLower = String(error.message || '').toLowerCase();
  if (errLower.includes('column') || error.code === 'PGRST204') {
    const fallbackRes = await supabase.from('portfolio_projects').upsert(basePayload, { onConflict: 'id' });
    if (!fallbackRes.error) {
      return { success: true };
    }
    return { success: false, error: fallbackRes.error.message };
  }

  return { success: false, error: error.message };
}

export const saveAllProjects = async (projects: ProjectItem[]): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const publicOnly = projects.filter(isPublicPublishedCaseStudy);
  (window as any).__INITIAL_CASE_STUDIES__ = publicOnly;
  safeSetItem(STORAGE_KEY, JSON.stringify(publicOnly));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: publicOnly }));

  if (isSupabaseConfigured()) {
    for (const p of projects) {
      const res = await upsertProjectRow(p);
      if (!res.success) {
        console.warn('Supabase portfolio sync notice:', res.error);
      }
    }
    import('../services/indexnowService')
      .then(({ invalidateServerSeoCache }) => invalidateServerSeoCache())
      .catch(() => {});
  }
  return true;
};

export const saveProject = async (project: ProjectItem): Promise<boolean> => {
  const normalized: ProjectItem = {
    ...project,
    slug: slugifyCaseStudy(project.slug || project.title, project.id),
    status: project.status || 'draft',
    customerConsentGranted: project.customerConsentGranted === true
  };

  if (isSupabaseConfigured()) {
    const res = await upsertProjectRow(normalized);
    if (!res.success) {
      console.error('Failed to save case study to Supabase:', res.error);
      return false;
    }
    const freshPublic = await fetchProjectsFromSupabase({ includeDrafts: false });
    if (typeof window !== 'undefined') {
      (window as any).__INITIAL_CASE_STUDIES__ = freshPublic;
      safeSetItem(STORAGE_KEY, JSON.stringify(freshPublic));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: freshPublic }));
    }

    const isPublishedPublic = isPublicPublishedCaseStudy(normalized);
    import('../services/indexnowService')
      .then(async ({ invalidateServerSeoCache, enqueueIndexNowUrls }) => {
        await invalidateServerSeoCache();
        await enqueueIndexNowUrls([`/portfolio/${normalized.slug}`, '/portfolio'], {
          action: isPublishedPublic ? 'publish_case_study' : 'unpublish_case_study',
          entityType: 'case_study',
          entitySlug: normalized.slug,
          verifyPublic: isPublishedPublic
        });
      })
      .catch(() => {});

    return true;
  }

  const all = getStoredProjectsSync();
  const idx = all.findIndex(p => p.id === normalized.id);
  const next = idx >= 0 ? all.map(p => (p.id === normalized.id ? normalized : p)) : [normalized, ...all];
  const publicOnly = next.filter(isPublicPublishedCaseStudy);
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEY, JSON.stringify(publicOnly));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: publicOnly }));
  }
  return true;
};

export const addProject = async (projectData: Omit<ProjectItem, 'id'>): Promise<ProjectItem> => {
  const id = `proj-${Date.now().toString(36)}`;
  const newProj: ProjectItem = {
    ...projectData,
    id,
    slug: slugifyCaseStudy(projectData.slug || projectData.title, id),
    status: projectData.status || 'draft',
    customerConsentGranted: projectData.customerConsentGranted === true
  };
  await saveProject(newProj);
  return newProj;
};

export const updateProject = async (id: string, updates: Partial<ProjectItem>): Promise<boolean> => {
  const current = await fetchProjectsFromSupabase({ includeDrafts: true });
  const existing = current.find(p => p.id === id);
  if (!existing) return false;
  return await saveProject({ ...existing, ...updates, id });
};

export const deleteProject = async (id: string): Promise<boolean> => {
  let deletedSlug = '';
  if (isSupabaseConfigured()) {
    const all = await fetchProjectsFromSupabase({ includeDrafts: true });
    deletedSlug = all.find(p => p.id === id)?.slug || '';
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete case study:', error.message);
      return false;
    }
    const freshPublic = await fetchProjectsFromSupabase({ includeDrafts: false });
    if (typeof window !== 'undefined') {
      (window as any).__INITIAL_CASE_STUDIES__ = freshPublic;
      safeSetItem(STORAGE_KEY, JSON.stringify(freshPublic));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: freshPublic }));
    }

    import('../services/indexnowService')
      .then(async ({ invalidateServerSeoCache, enqueueIndexNowUrls }) => {
        await invalidateServerSeoCache();
        await enqueueIndexNowUrls(['/portfolio', ...(deletedSlug ? [`/portfolio/${deletedSlug}`] : [])], {
          action: 'delete_case_study',
          entityType: 'case_study',
          entitySlug: deletedSlug || id,
          verifyPublic: false
        });
      })
      .catch(() => {});

    return true;
  }

  const current = getStoredProjectsSync();
  const filtered = current.filter(p => p.id !== id);
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: filtered }));
  }
  return true;
};

export const usePortfolioProjects = (options: { includeDrafts?: boolean } = {}) => {
  const includeDrafts = Boolean(options.includeDrafts);
  const [projects, setProjects] = useState<ProjectItem[]>(() => getStoredProjectsSync());

  useEffect(() => {
    fetchProjectsFromSupabase({ includeDrafts }).then(data => {
      if (Array.isArray(data)) setProjects(data);
    });

    const handleUpdate = () => {
      fetchProjectsFromSupabase({ includeDrafts }).then(data => {
        if (Array.isArray(data)) setProjects(data);
      });
    };
    window.addEventListener(EVENT_NAME, handleUpdate);

    let channel: any = null;
    if (isSupabaseConfigured() && !includeDrafts) {
      channel = supabase
        .channel('public_case_studies_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_projects' }, () => {
          handleUpdate();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      if (channel) supabase.removeChannel(channel);
    };
  }, [includeDrafts]);

  return {
    projects,
    featuredProjects: projects.filter(p => p.featured && isPublicPublishedCaseStudy(p)),
    addProject,
    updateProject,
    deleteProject
  };
};

export const getProjects = getStoredProjects;
