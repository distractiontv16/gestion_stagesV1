import bcrypt from 'bcrypt';

const motsDePasse = [
  'pass123', 'motdepasse', 'azerty', '123456', 'benin123',
  'gcpass1', 'gcpass2', 'gcapa1', 'gcapa2', 'geerpass'
];

const generateHashes = async () => {
  for (let mdp of motsDePasse) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(mdp, salt);
    console.log(`Mot de passe: ${mdp} | Hash: '${hash}',`);
  }
};

generateHashes();
