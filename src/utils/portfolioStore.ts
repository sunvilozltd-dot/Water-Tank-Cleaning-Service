import { useState, useEffect } from 'react';
import { ProjectItem } from '../types';
import { PROJECTS_DATA } from '../data/projectsData';
import { safeGetItem, safeSetItem } from './safeLocalStorage';

const STORAGE_KEY = 'sunviloz_portfolio_projects_v2';
const EVENT_NAME = 'sunviloz_portfolio_changed';

export const INITIAL_PROJECTS: ProjectItem[] = PROJECTS_DATA.map((p, idx) => ({
  ...p,
  featured: idx < 3,
  relatedServiceSlug: p.category === 'Underground' 
    ? 'underground-water-tank-cleaning' 
    : p.category === 'Pipeline' 
      ? 'water-pipeline-cleaning' 
      : 'water-overhead-tank-cleaning',
  additionalImages: [p.duringImg || p.afterImg].filter(Boolean) as string[]
}));

export const getStoredProjects = (): ProjectItem[] => {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      safeSetItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Failed to parse portfolio projects:', err);
    return INITIAL_PROJECTS;
  }
};

export const saveAllProjects = (projects: ProjectItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: projects }));
  } catch (err) {
    console.error('Failed to save portfolio projects:', err);
  }
};

export const addProject = (projectData: Omit<ProjectItem, 'id'>): ProjectItem => {
  const current = getStoredProjects();
  const id = `proj-${Date.now().toString(36)}`;
  const newProj: ProjectItem = {
    ...projectData,
    id
  };
  const updated = [newProj, ...current];
  saveAllProjects(updated);
  return newProj;
};

export const updateProject = (id: string, updates: Partial<ProjectItem>): boolean => {
  const current = getStoredProjects();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates };
  saveAllProjects([...current]);
  return true;
};

export const deleteProject = (id: string): boolean => {
  const current = getStoredProjects();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;
  saveAllProjects(filtered);
  return true;
};

export const usePortfolioProjects = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(() => getStoredProjects());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setProjects(e.detail || getStoredProjects());
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

export const saveProject = (project: ProjectItem): boolean => {
  const all = getStoredProjects();
  const index = all.findIndex(p => p.id === project.id);
  if (index >= 0) {
    return updateProject(project.id, project);
  } else {
    addProject(project);
    return true;
  }
};
