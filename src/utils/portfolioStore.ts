import { useState, useEffect } from 'react';
import { ProjectItem } from '../types';
import { PROJECTS_DATA } from '../data/projectsData';
import { safeGetItem, safeSetItem } from './safeLocalStorage';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'sunviloz_portfolio_projects_v3';
const EVENT_NAME = 'sunviloz_portfolio_changed';

export const INITIAL_PROJECTS: ProjectItem[] = PROJECTS_DATA;

export const getStoredProjects = async (): Promise<ProjectItem[]> => {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;

  // 1. Try fetching from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: ProjectItem[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          titleBn: d.title_bn,
          category: d.category || 'Rooftop',
          area: d.area || d.location,
          location: d.location,
          locationBn: d.location_bn,
          tankType: d.tank_type,
          capacity: d.capacity,
          serviceDate: d.service_date || d.completed_date,
          completedDate: d.completed_date,
          beforeImg: d.before_img || d.before_image,
          beforeImage: d.before_image || d.before_img,
          afterImg: d.after_img || d.after_image,
          afterImage: d.after_image || d.after_img,
          summary: d.summary || d.description,
          summaryBn: d.summary_bn || d.description_bn,
          description: d.description,
          descriptionBn: d.description_bn,
          featured: Boolean(d.featured),
          relatedServiceSlug: d.related_service_slug,
          customerConsentGranted: Boolean(d.customer_consent_granted ?? true)
        }));
        safeSetItem(STORAGE_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Could not load portfolio from Supabase:', err);
    }
  }

  // 2. Fall back to local storage
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse portfolio projects:', err);
  }

  return INITIAL_PROJECTS;
};

export const getStoredProjectsSync = (): ProjectItem[] => {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return INITIAL_PROJECTS;
};

export const saveAllProjects = async (projects: ProjectItem[]): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  safeSetItem(STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: projects }));

  if (isSupabaseConfigured()) {
    try {
      for (const p of projects) {
        await supabase
          .from('portfolio_projects')
          .upsert({
            id: p.id,
            title: p.title,
            title_bn: p.titleBn,
            category: p.category,
            area: p.area || p.location,
            location: p.location || p.area,
            location_bn: p.locationBn,
            tank_type: p.tankType,
            capacity: p.capacity,
            service_date: p.serviceDate || p.completedDate,
            completed_date: p.completedDate || p.serviceDate,
            before_img: p.beforeImg || p.beforeImage,
            before_image: p.beforeImage || p.beforeImg,
            after_img: p.afterImg || p.afterImage,
            after_image: p.afterImage || p.afterImg,
            summary: p.summary || p.description,
            summary_bn: p.summaryBn || p.descriptionBn,
            description: p.description || p.summary,
            description_bn: p.descriptionBn || p.summaryBn,
            featured: p.featured,
            customer_consent_granted: p.customerConsentGranted ?? true
          }, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('Supabase portfolio sync notice:', err);
    }
  }
  return true;
};

export const addProject = async (projectData: Omit<ProjectItem, 'id'>): Promise<ProjectItem> => {
  const current = getStoredProjectsSync();
  const id = `proj-${Date.now().toString(36)}`;
  const newProj: ProjectItem = {
    ...projectData,
    id,
    customerConsentGranted: true
  };
  const updated = [newProj, ...current];
  await saveAllProjects(updated);
  return newProj;
};

export const updateProject = async (id: string, updates: Partial<ProjectItem>): Promise<boolean> => {
  const current = getStoredProjectsSync();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates };
  await saveAllProjects([...current]);
  return true;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const current = getStoredProjectsSync();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;
  await saveAllProjects(filtered);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('portfolio_projects').delete().eq('id', id);
    } catch {
      // Ignore
    }
  }
  return true;
};

export const usePortfolioProjects = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(() => getStoredProjectsSync());

  useEffect(() => {
    getStoredProjects().then(data => {
      if (data) setProjects(data);
    });

    const handleUpdate = (e: any) => {
      setProjects(e.detail || getStoredProjectsSync());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  return {
    projects,
    featuredProjects: projects.filter(p => p.featured),
    addProject,
    updateProject,
    deleteProject
  };
};

export const getProjects = getStoredProjects;

export const saveProject = async (project: ProjectItem): Promise<boolean> => {
  const all = getStoredProjectsSync();
  const index = all.findIndex(p => p.id === project.id);
  if (index >= 0) {
    return await updateProject(project.id, project);
  } else {
    await addProject(project);
    return true;
  }
};
