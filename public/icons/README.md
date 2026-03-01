# Icônes PWA

Placez ici les icônes pour l’installation sur écran d’accueil (PWA).

## Fichiers requis

| Fichier        | Dimensions | Usage                          |
|----------------|------------|--------------------------------|
| `icon-192.png` | **192×192** px | Manifest, raccourcis Android/iOS |
| `icon-512.png` | **512×512** px | Splash / haute résolution       |

## Format

- **Format :** PNG (recommandé) ou JPEG
- **Contenu :** Logo ou icône de l’app, de préférence sur fond opaque (éviter la transparence pour un rendu uniforme).

## Apple Touch Icon (iOS)

Pour un meilleur rendu sur iOS, vous pouvez aussi ajouter :

- `apple-touch-icon.png` — **180×180** px (référencé dans `app/layout.tsx`)

Une fois les fichiers ajoutés, le manifest et le layout utilisent déjà ces chemins.
