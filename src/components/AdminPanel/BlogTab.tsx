import React, { useState } from 'react';
import { BlogPost } from '../../types/blog';
import { Plus, Edit2, Trash2, FileText, Calendar, Eye, AlertTriangle, ExternalLink } from 'lucide-react';
import { BlogPostModal } from './BlogPostModal';

interface BlogTabProps {
  posts: BlogPost[];
  onSavePost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
}

export const BlogTab: React.FC<BlogTabProps> = ({
  posts,
  onSavePost,
  onDeletePost
}) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const confirmDelete = () => {
    if (postToDelete) {
      onDeletePost(postToDelete.id);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Water Tank Cleaning Articles &amp; Blog</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold">
              {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage educational articles, hygiene tips, and SEO guides for Dhaka residents.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedPost(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Articles Published</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You do not have any published articles yet. Write helpful hygiene guides to boost your Google search visibility.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedPost(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Write First Article</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
              {post.imageUrl && (
                <div className="h-36 bg-slate-950 overflow-hidden relative">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 block mb-1">
                    {post.category} • {post.publishedAt}
                  </span>
                  <h3 className="font-bold text-white text-sm line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{post.excerpt}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">/{post.slug}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPost(post);
                        setIsModalOpen(true);
                      }}
                      title="Edit Article"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      title="Delete Article"
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
      )}

      {/* Delete Confirmation Modal (In-App, iFrame Safe) */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Delete Article?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="text-white font-semibold">&quot;{postToDelete.title}&quot;</span>? This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
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
                <span>Yes, Delete Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <BlogPostModal
          post={selectedPost}
          onClose={() => setIsModalOpen(false)}
          onSave={(saved) => {
            onSavePost(saved);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default BlogTab;
