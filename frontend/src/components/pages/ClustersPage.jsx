/**
 * Clusters Page (Page 1)
 * Define teacher contexts - the foundation of personalization
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Languages,
  GraduationCap,
  AlertTriangle,
  Settings,
  ArrowRight,
  Mountain,
  Home,
  Waves,
  Sun,
  TreePine,
  Landmark,
} from 'lucide-react';
import { PageTransition, FadeIn, listContainerVariants, listItemVariants } from '../ui/PageTransition';
import { PageHeader, Modal, Alert, EmptyState, ConfirmDialog, Badge, LoadingSpinner } from '../ui/SharedComponents';
import { getClusters, createCluster, updateCluster, deleteCluster } from '../../services/api';

// Configuration data
const REGION_TYPES = [
  'Urban', 'Rural', 'Tribal Belt', 'Semi-Urban',
  'Coastal', 'Hilly Region', 'Desert Region', 'Forest Area'
];

const LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Bengali', 'Tamil',
  'Telugu', 'Gujarati', 'Kannada', 'Malayalam',
  'Punjabi', 'Odia', 'Urdu', 'Gondi', 'Bhili', 'Santali'
];

const GRADE_RANGES = ['1-5', '1-8', '6-8', '6-10', '9-12', '1-12'];

const REGION_ICONS = {
  'Urban': Landmark,
  'Rural': Home,
  'Tribal Belt': Mountain,
  'Semi-Urban': Building2,
  'Coastal': Waves,
  'Hilly Region': Mountain,
  'Desert Region': Sun,
  'Forest Area': TreePine,
};

export default function ClustersPage() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    region_type: '',
    language: '',
    infrastructure_constraints: '',
    key_issues: '',
    grade_range: '',
  });

  const loadClusters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClusters();
      setClusters(data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load clusters' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClusters();
  }, [loadClusters]);

  const resetForm = () => {
    setFormData({
      name: '',
      region_type: '',
      language: '',
      infrastructure_constraints: '',
      key_issues: '',
      grade_range: '',
    });
    setEditingCluster(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (cluster) => {
    setFormData({
      name: cluster.name,
      region_type: cluster.region_type,
      language: cluster.language,
      infrastructure_constraints: cluster.infrastructure_constraints || '',
      key_issues: cluster.key_issues || '',
      grade_range: cluster.grade_range || '',
    });
    setEditingCluster(cluster);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      if (editingCluster) {
        await updateCluster(editingCluster.id, formData);
        setAlert({ type: 'success', message: 'Cluster updated successfully!' });
      } else {
        await createCluster(formData);
        setAlert({ type: 'success', message: 'Cluster created successfully!' });
      }
      setShowModal(false);
      resetForm();
      loadClusters();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to save cluster' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCluster(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Cluster deleted successfully!' });
      loadClusters();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to delete cluster' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getRegionIcon = (type) => {
    const IconComponent = REGION_ICONS[type] || MapPin;
    return IconComponent;
  };

  return (
    <PageTransition>
      <div className="page">
        <PageHeader
          title="Cluster Profiles"
          subtitle="Define unique school clusters with specific constraints and teaching contexts"
          pageNumber="1"
          action={
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Create Cluster
            </button>
          }
        />

        {/* Alerts */}
        <AnimatePresence>
          {alert && (
            <Alert type={alert.type} onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}
        </AnimatePresence>

        {/* Info box */}
        <FadeIn className="mb-8">
          <div 
            className="rounded-md p-4"
            style={{ 
              backgroundColor: 'var(--setu-50)',
              border: '1px solid var(--setu-200)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--setu-700)' }}>
              <strong>What are Clusters?</strong> Clusters represent groups of schools with similar 
              characteristics—like language, region type, and infrastructure challenges. 
              The AI uses these profiles to adapt training content appropriately.
            </p>
          </div>
        </FadeIn>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="skeleton w-12 h-12 rounded-full mb-4" />
                <div className="skeleton-heading mb-3" />
                <div className="skeleton-text w-3/4 mb-2" />
                <div className="skeleton-text w-1/2" />
              </div>
            ))}
          </div>
        ) : clusters.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Clusters Yet"
            description="Create your first cluster profile to start generating personalized training modules for specific teacher groups."
            action={
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Create First Cluster
              </button>
            }
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {clusters.map((cluster) => {
              const RegionIcon = getRegionIcon(cluster.region_type);
              return (
                <motion.div
                  key={cluster.id}
                  variants={listItemVariants}
                  className="card card-paper group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--setu-100)', color: 'var(--setu-600)' }}
                      >
                        <RegionIcon className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(cluster)}
                          className="btn btn-ghost btn-icon p-2"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(cluster)}
                          className="btn btn-ghost btn-icon p-2"
                          style={{ color: 'var(--danger-500)' }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--ink-800)' }}>
                      {cluster.name}
                    </h3>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary">
                        <MapPin className="w-3 h-3" />
                        {cluster.region_type}
                      </Badge>
                      <Badge variant="default">
                        <Languages className="w-3 h-3" />
                        {cluster.language}
                      </Badge>
                      {cluster.grade_range && (
                        <Badge variant="default">
                          <GraduationCap className="w-3 h-3" />
                          Grades {cluster.grade_range}
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    {cluster.infrastructure_constraints && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--ink-400)' }}>
                          <Settings className="w-3 h-3" />
                          Infrastructure
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--ink-600)' }}>
                          {cluster.infrastructure_constraints}
                        </p>
                      </div>
                    )}

                    {cluster.key_issues && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--ink-400)' }}>
                          <AlertTriangle className="w-3 h-3" />
                          Key Issues
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--ink-600)' }}>
                          {cluster.key_issues}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div 
                    className="px-6 py-3"
                    style={{ 
                      borderTop: '1px solid var(--paper-200)',
                      backgroundColor: 'rgba(251, 248, 241, 0.5)',
                    }}
                  >
                    <p className="text-xs" style={{ color: 'var(--ink-400)' }}>
                      Created {new Date(cluster.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Next page CTA */}
        {clusters.length > 0 && (
          <FadeIn delay={0.3} className="mt-8 text-center">
            <button
              onClick={() => navigate('/manuals')}
              className="btn btn-outline group"
            >
              Continue to Manuals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--ink-400)' }}>Turn to Page 2</p>
          </FadeIn>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingCluster ? 'Edit Cluster' : 'Create New Cluster'}
          icon={editingCluster ? Edit : Plus}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="modal-body space-y-5">
              {/* Name */}
              <div className="form-group">
                <label className="form-label">
                  Cluster Name <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Tribal Belt Schools - Gadchiroli"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <p className="form-hint">A descriptive name for this group of schools</p>
              </div>

              {/* Region and Language */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">
                    Region Type <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={formData.region_type}
                    onChange={(e) => setFormData({ ...formData, region_type: e.target.value })}
                    required
                  >
                    <option value="">Select region...</option>
                    {REGION_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Primary Language <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    required
                  >
                    <option value="">Select language...</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grade Range */}
              <div className="form-group">
                <label className="form-label">Grade Range</label>
                <select
                  className="form-input form-select"
                  value={formData.grade_range}
                  onChange={(e) => setFormData({ ...formData, grade_range: e.target.value })}
                >
                  <option value="">Select grades...</option>
                  {GRADE_RANGES.map((range) => (
                    <option key={range} value={range}>Grades {range}</option>
                  ))}
                </select>
              </div>

              {/* Infrastructure */}
              <div className="form-group">
                <label className="form-label">Infrastructure Constraints</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  placeholder="e.g., Limited internet, no projectors, irregular electricity..."
                  value={formData.infrastructure_constraints}
                  onChange={(e) => setFormData({ ...formData, infrastructure_constraints: e.target.value })}
                />
                <p className="form-hint">Describe any infrastructure limitations</p>
              </div>

              {/* Key Issues */}
              <div className="form-group">
                <label className="form-label">Key Issues</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  placeholder="e.g., High dropout rates, language barriers, seasonal migration..."
                  value={formData.key_issues}
                  onChange={(e) => setFormData({ ...formData, key_issues: e.target.value })}
                />
                <p className="form-hint">Educational challenges specific to this cluster</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : editingCluster ? (
                  'Update Cluster'
                ) : (
                  'Create Cluster'
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Cluster"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone, and any modules generated for this cluster will lose their context.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </PageTransition>
  );
}
