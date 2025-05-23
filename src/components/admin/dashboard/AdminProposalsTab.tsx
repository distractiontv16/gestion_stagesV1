import React, { useState } from 'react';

interface InternshipProposal {
  id: number;
  company: string;
  position: string;
  location: string;
  description: string;
  requirements: string;
  duration: string;
  filiere: string;
}

interface AdminProposalsTabProps {
  initialProposals: InternshipProposal[];
  // Ajouter d'autres props si nécessaire, par exemple pour la persistence des données
}

const AdminProposalsTab: React.FC<AdminProposalsTabProps> = ({ initialProposals }) => {
  const [proposals, setProposals] = useState<InternshipProposal[]>(initialProposals);
  const [newProposal, setNewProposal] = useState<Omit<InternshipProposal, 'id'>>({
    company: '',
    position: '',
    location: '',
    description: '',
    requirements: '',
    duration: '',
    filiere: ''
  });
  const [editingProposal, setEditingProposal] = useState<InternshipProposal | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, proposalType: 'new' | 'edit') => {
    const { name, value } = e.target;
    if (proposalType === 'new') {
      setNewProposal(prev => ({ ...prev, [name]: value }));
    } else if (editingProposal) {
      setEditingProposal(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSubmitNewProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(newProposal).some(val => val.trim() === '')) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    const newId = proposals.length > 0 ? Math.max(...proposals.map(p => p.id)) + 1 : 1;
    const proposalToAdd: InternshipProposal = { ...newProposal, id: newId }; 
    setProposals(prev => [...prev, proposalToAdd]);
    setNewProposal({ company: '', position: '', location: '', description: '', requirements: '', duration: '', filiere: '' });
    alert('Proposition de stage ajoutée avec succès!');
    // TODO: Ajouter un appel API pour sauvegarder la nouvelle proposition
  };

  const handleEditProposal = (proposal: InternshipProposal) => {
    setEditingProposal({...proposal});
  };

  const handleSubmitEditProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal || Object.values(editingProposal).some(val => typeof val === 'string' && val.trim() === '')) {
        alert('Veuillez remplir tous les champs pour la modification.');
        return;
    }
    setProposals(prev => prev.map(p => p.id === editingProposal.id ? editingProposal : p));
    setEditingProposal(null);
    alert('Proposition de stage modifiée avec succès!');
    // TODO: Ajouter un appel API pour sauvegarder la proposition modifiée
  };

  const handleDeleteProposal = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette proposition?')) {
      setProposals(prev => prev.filter(proposal => proposal.id !== id));
      alert(`Proposition ${id} supprimée.`);
      // TODO: Ajouter un appel API pour supprimer la proposition
    }
  };

  const filiereOptions = ['GEI/EE', 'GEI/IT', 'GE/ER', 'GMP', 'MSY/MI', 'ER/SE', 'GC/A', 'GC/B', 'MSY/MA', 'GE/FC'];
  
  const renderFormFields = (data: Omit<InternshipProposal, 'id'> | InternshipProposal, type: 'new' | 'edit') => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
                <label htmlFor={`${type}-company`} className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                <input type="text" id={`${type}-company`} name="company" value={data.company} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
            </div>
            <div>
                <label htmlFor={`${type}-position`} className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                <input type="text" id={`${type}-position`} name="position" value={data.position} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
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
                <label htmlFor={`${type}-requirements`} className="block text-sm font-medium text-gray-700 mb-1">Compétences requises (séparées par des virgules)</label>
                <input type="text" id={`${type}-requirements`} name="requirements" value={data.requirements} onChange={(e) => handleInputChange(e, type)} className="form-input" required />
            </div>
            <div>
              <label htmlFor={`${type}-filiere`} className="block text-sm font-medium text-gray-700 mb-1">Filière cible</label>
              <select id={`${type}-filiere`} name="filiere" value={data.filiere} onChange={(e) => handleInputChange(e, type)} className="form-select" required>
                <option value="">Sélectionner une filière</option>
                {filiereOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
        </div>
        <div className="mt-5">
            <label htmlFor={`${type}-description`} className="block text-sm font-medium text-gray-700 mb-1">Description du stage</label>
            <textarea id={`${type}-description`} name="description" value={data.description} onChange={(e) => handleInputChange(e, type)} rows={4} className="form-textarea" required></textarea>
        </div>
    </>
  );

  return (
    <div className="space-y-8">
      {/* Formulaire d'ajout/modification de proposition */}
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

      {/* Liste des propositions existantes */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Propositions de stages existantes ({proposals.length})</h3>
        {proposals.length > 0 ? (
            <ul className="space-y-5">
            {proposals.map(proposal => (
                <li key={proposal.id} className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-grow">
                    <h4 className="text-lg font-semibold text-blue-700">{proposal.position}</h4>
                    <p className="text-gray-800 font-medium">{proposal.company} - <span className="text-gray-600 text-sm">{proposal.location}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Durée: {proposal.duration}</p>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">{proposal.description}</p>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compétences:</p>
                        <p className="text-sm text-gray-600">{proposal.requirements}</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filière cible:</p>
                        <span className="inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{proposal.filiere}</span>
                    </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                    <button 
                        onClick={() => handleEditProposal(proposal)} 
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