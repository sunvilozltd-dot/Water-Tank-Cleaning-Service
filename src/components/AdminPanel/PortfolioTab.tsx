import React, { useState } from 'react';
import { ProjectItem } from '../../types';
import { Plus, Edit2, Trash2, Layers, AlertTriangle } from 'lucide-react';
import { ProjectModal } from './ProjectModal';

interface PortfolioTabProps {
  projects: ProjectItem[];
  onSaveProject: (project: ProjectItem) => void;
  onDeleteProject: (id: string) => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  projects,
  onSaveProject,
  onDeleteProject
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);

  const handleEdit = (proj: ProjectItem) => {
    setSelectedProject(proj);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Before &amp; After Proofs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold">
              {projects.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage real project cases, sludge extraction photos, and tank cleaning before/after results.</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
            <div className="grid grid-cols-2 h-36 bg-slate-950 border-b border-slate-800 relative">
              <div className="relative overflow-hidden">
                <img src={proj.beforeImage} alt="Before" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">Before</span>
              </div>
              <div className="relative overflow-hidden border-l border-slate-800">
                <img src={proj.afterImage} alt="After" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">After</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 block mb-1">
                  {proj.category} • {proj.location}
                </span>
                <h3 className="font-bold text-white text-sm line-clamp-1">{proj.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">{proj.tankType}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(proj)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(proj)}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded border border-rose-900/40 hover:border-rose-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Delete Project?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="text-white font-semibold">&quot;{projectToDelete.title}&quot;</span>?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setIsModalOpen(false)}
          onSave={(saved) => {
            onSaveProject(saved);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PortfolioTab;
