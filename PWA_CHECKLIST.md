# Checklist de test PWA

## 1. Build et démarrage en production

```bash
npm run build && npm run start
```

- Le build doit se terminer sans erreur (avec `next build --webpack` pour que le service worker soit généré).
- Ouvrir `http://localhost:3000` dans le navigateur.

## 2. Chrome DevTools → Application

1. Ouvrir les DevTools (F12 ou Cmd+Option+I).
2. Onglet **Application** (ou **Application** dans le menu).
3. **Manifest** :
   - Vérifier que le manifest est chargé (`/manifest.webmanifest`).
   - Vérifier : name, short_name, start_url, display: standalone, theme_color, icons.
4. **Service Workers** :
   - Un service worker doit être enregistré (ex. `sw.js`).
   - Statut : activé.

## 3. Installation sur bureau (Chrome / Edge)

- Dans la barre d’adresse ou le menu : **Installer l’application** / **Installer FinPilot**.
- L’app doit s’ouvrir en fenêtre standalone (sans barre d’adresse).

## 4. iOS Safari → Sur l’écran d’accueil

1. Ouvrir le site dans **Safari** sur iPhone/iPad.
2. Bouton **Partager** (carré avec flèche).
3. **Sur l’écran d’accueil** (ou **Ajouter à l’écran d’accueil**).
4. Vérifier le nom et l’icône, puis **Ajouter**.
5. Lancer l’icône : l’app doit s’ouvrir en plein écran (sans barre Safari).

## 5. Android Chrome

1. Menu (⋮) → **Installer l’application** / **Ajouter à l’écran d’accueil**.
2. L’app doit s’ouvrir en mode standalone.

## 6. Mise à jour après déploiement

- Après un nouveau déploiement, recharger la PWA (ou fermer et rouvrir) : les changements doivent apparaître rapidement grâce à `skipWaiting` et `clientsClaim` dans le service worker.

---

**Note** : En développement (`npm run dev`), la PWA est désactivée (pas de service worker). Tester l’installation et le manifest uniquement après `npm run build && npm run start`.
