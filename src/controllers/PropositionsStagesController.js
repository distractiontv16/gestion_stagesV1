import pool from '../config/db.js'; // Ou db selon votre configuration, ajustez si nécessaire

// Récupérer toutes les propositions de stages
export const getPropositionsStages = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        entreprise_nom, 
        titre, 
        location, 
        description, 
        requirements, 
        duration, 
        filiere_id, 
        created_at, 
        updated_at, 
        date_publication, 
        statut, 
        entreprise_id
      FROM public.propositions_stages
      ORDER BY date_publication DESC, created_at DESC;
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows); // Renvoie directement le tableau d'offres
  } catch (error) {
    console.error("Erreur lors de la récupération des propositions de stages:", error);
    res.status(500).json({ 
      message: "Erreur serveur lors de la récupération des propositions de stages.", 
      details: error.message 
    });
  }
}; 