/**
 * pulsa-css — JavaScript entry point
 *
 * Ce fichier existe pour la compatibilité avec les bundlers qui resolvent
 * les imports JS en premier. Il ré-exporte simplement le chemin CSS.
 *
 * Usage dans un projet bundlé (Vite, Webpack, etc.) :
 *   import 'pulsa-css';
 *   // → importe automatiquement pulsa.css via le champ "style" de package.json
 *
 * Ou import explicite :
 *   import 'pulsa-css/pulsa.css';
 *   import 'pulsa-css/pulsa-tokens.css';
 */

// Rien à exporter côté JS — c'est un framework CSS pur.
// Bundlers comme Vite/Webpack utilisent le champ "style" ou "exports" de package.json.
