import React, { useState } from 'react';
import type { Project } from '../../types';
import ErrorModal from '../Modals/ErrorModal';
import './Projects.css';

interface ProjectStatusFormProps {
  initialData: Project;
  onSave: (id: number, estado: 'P' | 'F' | 'E') => Promise<void>;
  onCancel: () => void;
  onError?: (title: string, message: string | string[]) => void;
}

const ProjectStatusForm: React.FC<ProjectStatusFormProps> = ({ initialData, onSave, onCancel, onError }) => {
  const [estado, setEstado] = useState<'P' | 'F' | 'E'>(initialData.estado);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string | string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave(initialData.idProyecto, estado);
    } catch (error: any) {
      console.error('Error updating status:', error);
      const title = 'Error al actualizar estado';
      const message = error.response?.data?.message || 'No se pudo actualizar el estado del proyecto.';
      
      if (onError) {
        onError(title, message);
      } else {
        setErrorInfo({ title, message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="project-form-container status-only">
      <div className="form-header">
        <h2>Actualizar Estado</h2>
        <button className="close-button" onClick={onCancel} disabled={isSubmitting}>&times;</button>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-section">
          <div className="form-group">
            <label>Proyecto</label>
            <input type="text" value={initialData.nombre} readOnly className="read-only-input" />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Nuevo Estado</label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as 'P' | 'F' | 'E')}
              disabled={isSubmitting}
              required
            >
              <option value="E">En Espera</option>
              <option value="P">En Proceso</option>
              <option value="F">Finalizado</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel} disabled={isSubmitting}>
            CANCELAR
          </button>
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? 'GUARDANDO...' : 'ACTUALIZAR ESTADO'}
          </button>
        </div>
      </form>

      <ErrorModal
        isOpen={!!errorInfo}
        title={errorInfo?.title || ''}
        message={errorInfo?.message || ''}
        onClose={() => setErrorInfo(null)}
      />
    </div>
  );
};

export default ProjectStatusForm;
