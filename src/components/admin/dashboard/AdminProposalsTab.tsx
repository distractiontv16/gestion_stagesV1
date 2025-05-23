import React, { useState, useEffect, useCallback } from 'react';

interface Filiere {
  filiere_id: number;
  filiere_nom: string;
}

interface InternshipProposal {
  id: number;
  titre: string;
  description: string;
  requirements: string;
  entreprise_nom: string;
  entreprise_id?: number | null;
  location: string;
  duration: string;
  filiere_id: number | null;
  nom_filiere?: string;
  statut: 'active' | 'expiree' | 'pourvue';
  date_publication?: string;
  updated_at?: string;
}

type NewInternshipProposal = Omit<InternshipProposal, 'id' | 'nom_filiere' | 'date_publication' | 'updated_at'>;

interface AdminProposalsTabProps {
  // Ajouter d'autres props si nécessaire, par exemple pour la persistence des données
}

const AdminProposalsTab: React.FC<AdminProposalsTabProps> = () => {
  const [proposals, setProposals] = useState<InternshipProposal[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFilieres, setIsLoadingFilieres] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFilieres, setErrorFilieres] = useState<string | null>(null);

  const initialNewProposalState: NewInternshipProposal = {
    entreprise_nom: '',
    titre: '',
    location: '',
    description: '',
    requirements: '',
    duration: '',
    filiere_id: null,
    entreprise_id: null,
    statut: 'active',
  };
  const [newProposal, setNewProposal] = useState<NewInternshipProposal>(initialNewProposalState);
  const [editingProposal, setEditingProposal] = useState<InternshipProposal | null>(null);

  const API_BASE_URL = '/api/admin';

  const fetchProposals = useCallback(async (token: string | null) => {
    setIsLoading(true);
    setError(null);
    if (!token) {
      setError('Token d\'authentification manquant.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/propositions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setProposals(data.data.propositions);
      } else {
        throw new Error(data.message || 'Failed to fetch proposals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching proposals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilieres = useCallback(async (token: string | null) => {
    setIsLoadingFilieres(true);
    setErrorFilieres(null);
    if (!token) {
      setErrorFilieres('Token d\'authentification manquant.');
      setIsLoadingFilieres(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/parametres/filiere`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setFilieres(data.data.map((item: any) => ({ filiere_id: item.filiere_id, filiere_nom: item.filiere_nom })));
      } else {
        throw new Error(data.message || 'Failed to fetch filieres');
      }
    } catch (err) {
      setErrorFilieres(err instanceof Error ? err.message : String(err));
      console.error("Error fetching filieres:", err);
    } finally {
      setIsLoadingFilieres(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetchProposals(token);
    fetchFilieres(token);
  }, [fetchProposals, fetchFilieres]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, proposalType: 'new' | 'edit') => {
    const { name, value } = e.target;
    const parsedValue = name === 'filiere_id' ? (value ? parseInt(value, 10) : null) : value;

    if (proposalType === 'new') {
      setNewProposal(prev => ({ ...prev, [name]: parsedValue }));
    } else if (editingProposal) {
      setEditingProposal(prev => {
        if (!prev) return null;
        return { ...prev, [name]: parsedValue };
      });
    }
  };

  const handleSubmitNewProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(newProposal).some(val => val === '')) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!newProposal.filiere_id) {
      alert('Veuillez sélectionner une filière.');
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Non authentifié');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/propositions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProposal),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error adding proposal');
      }
      alert('Proposition de stage ajoutée avec succès!');
      setNewProposal(initialNewProposalState);
      fetchProposals(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      alert(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProposalClick = (proposal: InternshipProposal) => {
    setEditingProposal({
      ...proposal,
      filiere_id: typeof proposal.filiere_id === 'string' ? parseInt(proposal.filiere_id, 10) : proposal.filiere_id
    });
  };

  const handleSubmitEditProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;
    if (!editingProposal.filiere_id) {
      alert('Veuillez sélectionner une filière pour la modification.');
      return;
    }
    if (Object.values(editingProposal).some(val => typeof val === 'string' && val.trim() === '')) {
      alert('Veuillez remplir tous les champs pour la modification.');
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Non authentifié');
      setIsLoading(false);
      return;
    }
    try {
      const { nom_filiere, date_publication, updated_at, ...payload } = editingProposal;

      const response = await fetch(`${API_BASE_URL}/propositions/${editingProposal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error updating proposal');
      }
      alert('Proposition de stage modifiée avec succès!');
      setEditingProposal(null);
      fetchProposals(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      alert(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProposal = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette proposition?')) {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Non authentifié');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/propositions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Error deleting proposal');
        }
        alert(`Proposition ${id} supprimée.`);
        fetchProposals(token);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        alert(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderFormFields = (data: NewInternshipProposal | InternshipProposal, type: 'new' | 'edit') => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <label htmlFor={`${type}-entreprise_nom`} className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
          <input type="text" id={`${type}-entreprise_nom`} name="entreprise_nom" value={data.entreprise_nom} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
        </div>
        <div>
          <label htmlFor={`${type}-titre`} className="block text-sm font-medium text-gray-700 mb-1">Titre du Poste</label>
          <input type="text" id={`${type}-titre`} name="titre" value={data.titre} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
        </div>
        <div>
          <label htmlFor={`${type}-location`} className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
          <input type="text" id={`${type}-location`} name="location" value={data.location} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
        </div>
        <div>
          <label htmlFor={`${type}-duration`} className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
          <input type="text" id={`${type}-duration`} name="duration" value={data.duration} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${type}-requirements`} className="block text-sm font-medium text-gray-700 mb-1">Compétences requises</label>
          <input type="text" id={`${type}-requirements`} name="requirements" value={data.requirements} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
        </div>
        <div>
          <label htmlFor={`${type}-filiere_id`} className="block text-sm font-medium text-gray-700 mb-1">Filière cible</label>
          <select id={`${type}-filiere_id`} name="filiere_id" value={data.filiere_id === null ? '' : data.filiere_id} onChange={(e) => handleInputChange(e, type)} className="form-select" required>
            <option value="">Sélectionner une filière</option>
            {isLoadingFilieres ? <option disabled>Chargement...</option> : 
             filieres.length === 0 && !errorFilieres ? <option disabled>Aucune filière trouvée</option> :
             errorFilieres ? <option disabled>Erreur chargement filières</option> :
             filieres.map(f => <option key={f.filiere_id} value={f.filiere_id}>{f.filiere_nom}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${type}-statut`} className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select id={`${type}-statut`} name="statut" value={data.statut} onChange={(e) => handleInputChange(e, type)} className="form-select" required>
            <option value="active">Active</option>
            <option value="expiree">Expirée</option>
            <option value="pourvue">Pourvue</option>
          </select>
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor={`${type}-description`} className="block text-sm font-medium text-gray-700 mb-1">Description du stage</label>
        <textarea id={`${type}-description`} name="description" value={data.description} onChange={(e) => handleInputChange(e, type)} rows={4} className="form-textarea" required></textarea>
      </div>
    </>
  );

  if (isLoading && !proposals.length) return <p className="text-center py-10">Chargement des propositions...</p>;
  if (error) return <p className="text-center text-red-500 py-10">Erreur: {error}</p>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {editingProposal ? 'Modifier la proposition de stage' : 'Ajouter une nouvelle proposition de stage'}
        </h3>
        <form onSubmit={editingProposal ? handleSubmitEditProposal : handleSubmitNewProposal} className="space-y-6">
          {renderFormFields(editingProposal || newProposal, editingProposal ? 'edit' : 'new')}
          <div className="flex justify-end gap-3 pt-4">
            {editingProposal && (
              <button type="button" onClick={() => setEditingProposal(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                Annuler l'édition
              </button>
            )}
            <button type="submit" className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-150 ease-in-out ${editingProposal ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700' }`}>
              {editingProposal ? 'Sauvegarder les modifications' : 'Ajouter la proposition'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Propositions de stages existantes ({proposals.length})</h3>
        {proposals.length > 0 ? (
          <ul className="space-y-5">
            {proposals.map(proposal => (
              <li key={proposal.id} className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold text-blue-700">{proposal.titre}</h4>
                    <p className="text-gray-800 font-medium">{proposal.entreprise_nom} - <span className="text-gray-600 text-sm">{proposal.location}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Durée: {proposal.duration}</p>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">{proposal.description}</p>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compétences:</p>
                      <p className="text-sm text-gray-600">{proposal.requirements}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filière cible:</p>
                      <span className="inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {proposal.nom_filiere || `ID: ${proposal.filiere_id}`}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut:</p>
                      <span className={`inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full 
                        ${proposal.statut === 'active' ? 'bg-green-100 text-green-800' : 
                          proposal.statut === 'pourvue' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {proposal.statut}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      <p>Publié le: {proposal.date_publication ? new Date(proposal.date_publication).toLocaleDateString() : 'N/A'}</p>
                      <p>Mis à jour le: {proposal.updated_at ? new Date(proposal.updated_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                    <button 
                      onClick={() => handleEditProposalClick(proposal)} 
                      className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors w-full sm:w-auto"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDeleteProposal(proposal.id)} 
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors w-full sm:w-auto"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">Aucune proposition de stage pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default AdminProposalsTab; 