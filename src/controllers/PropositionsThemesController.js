import db from '../config/db.js';
const { query } = db;

// Get all proposition_themes
export const getPropositionsThemes = async (req, res) => {
    try {
        const result = await query(
            `SELECT pt.*, f.nom AS nom_filiere 
             FROM proposition_themes pt
             LEFT JOIN filieres f ON pt.filiere_id = f.id
             ORDER BY pt.date_soumission DESC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des propositions de thèmes:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des propositions de thèmes.", details: error.message });
    }
};

// Get a single proposition_theme by ID
export const getPropositionThemeById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(
            `SELECT pt.*, f.nom AS nom_filiere 
             FROM proposition_themes pt
             LEFT JOIN filieres f ON pt.filiere_id = f.id
             WHERE pt.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Proposition de thème non trouvée." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Erreur lors de la récupération de la proposition de thème ${id}:`, error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération de la proposition de thème.", details: error.message });
    }
};

// Create a new proposition_theme
export const createPropositionTheme = async (req, res) => {
    const {
        titre,
        description,
        auteur_nom,
        auteur_type,
        filiere_id, // Peut être null
        entreprise_nom, // Peut être null
        email_contact, // Peut être null
        difficulte,
        technologies_suggerees, // Array de strings
        objectifs_pedagogiques, // Peut être null
        est_validee, // Boolean, default FALSE
        statut // Default 'soumise'
    } = req.body;

    if (!titre || !auteur_nom || !auteur_type || !difficulte) {
        return res.status(400).json({ message: "Les champs titre, auteur_nom, auteur_type et difficulte sont requis." });
    }

    try {
        const result = await query(
            `INSERT INTO proposition_themes 
             (titre, description, auteur_nom, auteur_type, filiere_id, entreprise_nom, email_contact, difficulte, technologies_suggerees, objectifs_pedagogiques, est_validee, statut, date_soumission) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
             RETURNING *`,
            [titre, description, auteur_nom, auteur_type, filiere_id || null, entreprise_nom || null, email_contact || null, difficulte, technologies_suggerees || [], objectifs_pedagogiques || null, est_validee || false, statut || 'soumise']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erreur lors de la création de la proposition de thème:", error);
        res.status(500).json({ message: "Erreur serveur lors de la création de la proposition de thème.", details: error.message });
    }
};

// Update an existing proposition_theme
export const updatePropositionTheme = async (req, res) => {
    const { id } = req.params;
    const {
        titre,
        description,
        auteur_nom,
        auteur_type,
        filiere_id,
        entreprise_nom,
        email_contact,
        difficulte,
        technologies_suggerees,
        objectifs_pedagogiques,
        est_validee,
        statut
    } = req.body;

    if (!titre || !auteur_nom || !auteur_type || !difficulte) {
        return res.status(400).json({ message: "Les champs titre, auteur_nom, auteur_type et difficulte sont requis pour la mise à jour." });
    }

    try {
        const result = await query(
            `UPDATE proposition_themes 
             SET titre = $1, description = $2, auteur_nom = $3, auteur_type = $4, filiere_id = $5, 
                 entreprise_nom = $6, email_contact = $7, difficulte = $8, technologies_suggerees = $9, 
                 objectifs_pedagogiques = $10, est_validee = $11, statut = $12, updated_at = NOW()
             WHERE id = $13
             RETURNING *`,
            [titre, description, auteur_nom, auteur_type, filiere_id || null, entreprise_nom || null, email_contact || null, difficulte, technologies_suggerees || [], objectifs_pedagogiques || null, est_validee, statut, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Proposition de thème non trouvée pour la mise à jour." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la proposition de thème ${id}:`, error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la proposition de thème.", details: error.message });
    }
};

// Delete a proposition_theme
export const deletePropositionTheme = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query("DELETE FROM proposition_themes WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Proposition de thème non trouvée pour la suppression." });
        }
        res.status(200).json({ message: "Proposition de thème supprimée avec succès." });
    } catch (error) {
        console.error(`Erreur lors de la suppression de la proposition de thème ${id}:`, error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression de la proposition de thème.", details: error.message });
    }
}; 