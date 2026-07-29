// Email interne fictif : Firebase Auth n'accepte que des inscriptions par email,
// mais l'utilisateur ne voit et ne saisit jamais que son pseudo. Le domaine
// .invalid est réservé par la RFC 2606 pour désigner une adresse qui n'existe
// pas et ne doit jamais recevoir de courrier (à la différence de .local,
// réservé à mDNS).
const DOMAINE_EMAIL_FICTIF = 'ndc.invalid';

export const PSEUDO_MIN = 3;
export const PSEUDO_MAX = 30;
export const MOT_DE_PASSE_MIN = 8;

export function slugifyPseudo(pseudoAffichage: string): string {
  return pseudoAffichage
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, PSEUDO_MAX);
}

export function validerPseudo(pseudoAffichage: string): string | null {
  const propre = pseudoAffichage.trim();
  if (propre.length < PSEUDO_MIN) {
    return `Le pseudo doit contenir au moins ${PSEUDO_MIN} caractères.`;
  }
  const slug = slugifyPseudo(propre);
  if (slug.length < PSEUDO_MIN) {
    return 'Le pseudo doit contenir au moins une lettre ou un chiffre.';
  }
  return null;
}

export function validerMotDePasse(motDePasse: string): string | null {
  if (motDePasse.length < MOT_DE_PASSE_MIN) {
    return `Le mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères.`;
  }
  return null;
}

export function emailFictifDepuisPseudo(pseudoAffichage: string): string {
  return `${slugifyPseudo(pseudoAffichage)}@${DOMAINE_EMAIL_FICTIF}`;
}
