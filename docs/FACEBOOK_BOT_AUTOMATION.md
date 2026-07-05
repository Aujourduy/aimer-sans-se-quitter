# FB-Bot — Publication quotidienne automatisée sur 2 profils Facebook

**Statut :** Plan validé, implémentation NON commencée
**Version doc :** 2.0 (réécriture complète — remplace la v1 du 2026-07-05)
**Dernière mise à jour :** 2026-07-05
**Objectif :** 1 post/jour sur chacun des 2 profils Facebook perso, pendant 10 ans, zéro intervention (hors re-auth cookies ~tous les 2-3 mois)

> ⚠️ **CE DOCUMENT EST LA RÉFÉRENCE UNIQUE DU PROJET.**
> Si la session Claude plante pendant l'implémentation : ouvrir une nouvelle session,
> lire ce doc, exécuter le **Protocole de reprise (§3)**, reprendre à l'epic en cours.
> **Règle : cocher les epics (§2) au fur et à mesure, dans le même moment que leur complétion.**

---

## 1. DÉCISIONS ACTÉES (ne pas re-débattre)

| # | Décision | Justification | Date |
|---|----------|---------------|------|
| D1 | **Playwright** (pas l'API Graph) | L'API Facebook ne permet PAS de publier sur des profils perso, seulement des pages | 2026-07-04 |
| D2 | **Serveur local** (ce serveur), pas de cloud | IP stable = moins de détection anti-bot, gratuit, contrôle total | 2026-07-04 |
| D3 | **Docker**, 2 conteneurs de publication (1 par compte) + 1 sidecar monitoring | Isolation par compte, redémarrage facile après crash | 2026-07-04 |
| D4 | **Projet indépendant** `/home/dang/fb-bot/` avec son propre repo git | Découplage du repo site (actif) ; le bot doit être "gelé et oublié" 10 ans ; évite qu'un `git clean` du site efface les cookies | 2026-07-05 |
| D5 | `posts.json` **committé** dans le repo bot (pas généré à la volée depuis le site) | Le bot est un artefact autonome et reproductible ; aucune dépendance vivante vers la structure interne d'Astro | 2026-07-05 |
| D6 | `sync-posts.sh` vit dans le **repo bot** et lit le repo site | Le bot connaît sa source ; le site ignore le bot. Sync = opération manuelle rare et bénigne (queue obsolète ne casse rien) | 2026-07-05 |
| D7 | **Queue statefull par compte** (fichiers plats), PAS de formule `jour % 116` | Permet de modifier l'ordre, suivre l'historique, pauser, exclure — demande explicite de Duy | 2026-07-05 |
| D8 | État = fichiers plats JSON/JSONL (pas SQLite, pas de dashboard web) | Gratuit / long-terme / simple : lisible à la main, éditable, grepable, backupable | 2026-07-05 |
| D9 | **Posts différents sur chaque compte le même jour** (queue account2 décalée de 58) | **Anti-détection** : 2 profils postant le même texte le même jour depuis la même IP = signal d'automatisation évident pour FB. Le décalage de 58 espace aussi de ~2 mois le passage d'un même texte d'un compte à l'autre | 2026-07-04 |
| D10 | Monitoring = **email + fichiers logs** (pas d'UI web pour l'instant) | Demande de Duy ; UI ajoutabe plus tard si besoin | 2026-07-04 |
| D11 | Cookies : **connexion manuelle initiale**, puis sessions persistées en volume + **backup mensuel tar** | Les cookies sont le seul actif non-régénérable du système | 2026-07-05 |
| D12 | Conteneurs de publication = **one-shot** (`docker compose run --rm`), lancés par cron. Seul le monitor est long-running | ⚠️ Correction v1 : un script one-shot avec `restart: unless-stopped` republierait en boucle | 2026-07-05 |
| D13 | Pas de BMAD | Projet ~6h, périmètre figé, ce doc = PRD + architecture. Le risque réel (anti-bot FB) se résout empiriquement, pas par la planification | 2026-07-05 |
| D14 | **Sync auto quotidienne du corpus côté bot** (`check-corpus.sh`, cron 1×/jour) — pas de hook pre-commit dans le repo site | Automatise le caractère manuel de D6 sans le renverser : le site reste 100 % ignorant du bot. Hash des .md du site comparé au hash stocké dans posts.json ; si différent → régénération + signalement email. Latence max 24h = indifférente (1 post/jour). Un pre-commit aurait couplé le site au bot et pu bloquer les commits du site | 2026-07-05 |

**Hypothèses à confirmer au premier test réel** (§9) : niveau de détection anti-bot, durée de vie réelle des cookies, tolérance de FB à la re-publication d'un même texte à ~116 jours d'intervalle.

---

## 2. EPICS — CHECKLIST D'IMPLÉMENTATION

> Chaque epic est autonome, a un critère de vérification, et indique comment détecter
> son état depuis le filesystem (pour la reprise après crash).
> ✅ = fait et vérifié · 🔶 = en cours · ⬜ = non commencé

### ✅ EPIC 1 — Squelette du projet indépendant
**Objectif :** repo `/home/dang/fb-bot/` initialisé avec structure complète.
**Actions :**
1. `mkdir /home/dang/fb-bot && cd /home/dang/fb-bot && git init`
2. Créer l'arborescence (§4) : `data/`, `cookies/account1/`, `cookies/account2/`, `logs/`, `scripts/`, `backups/`
3. `.gitignore` : `cookies/`, `logs/`, `backups/`, `.env`, `node_modules/`
4. `README.md` minimal pointant vers `docs/PLAN.md`
5. **Copier CE document** dans `/home/dang/fb-bot/docs/PLAN.md` — le repo bot devient autosuffisant ; c'est la copie du bot qui fait foi ensuite
6. `.env.example` (SMTP, ALERT_EMAIL, TZ=Europe/Paris)

**Vérif :** `test -d /home/dang/fb-bot/.git && test -f /home/dang/fb-bot/docs/PLAN.md`
**Détection reprise :** si `/home/dang/fb-bot/` existe → epic commencé ; si `docs/PLAN.md` y est → probablement fini.

### ✅ EPIC 2 — Extraction du corpus (`posts.json`)
**Objectif :** les 116 posts extraits du site vers `data/posts.json`, committé.
**Actions :**
1. `scripts/sync-posts.sh` (+ `scripts/extract-posts.js` Node) : lit `/home/dang/La-Revue-Aimer-sans-se-quitter/src/content/textes/*.md`, parse frontmatter (title) + corps, génère `data/posts.json` (format §5.1)
2. Exécuter, vérifier le contenu (échantillon manuel de 3 posts : texte intégral, pas de résidu markdown/frontmatter)
3. Commit dans le repo bot

**Vérif :** `node -e "const p=require('/home/dang/fb-bot/data/posts.json'); console.log(p.posts.length)"` → `116` ; contrôle visuel de 3 posts.
**Détection reprise :** `data/posts.json` existe et contient 116 posts → fini.

### ✅ EPIC 3 — Génération des queues initiales
**Objectif :** `queue-account1.json` et `queue-account2.json` prêtes.
**Actions :**
1. `scripts/init-queues.js` : queue1 = slugs dans l'ordre de `posts.json` ; queue2 = même liste **décalée de 58** (rotation) → jamais le même post le même jour sur les 2 comptes
2. Exécuter, committer les queues initiales

**Vérif :** les 2 fichiers existent, 116 entrées chacun, `queue1[0] !== queue2[0]`, décalage de 58 vérifié.
**Détection reprise :** présence des 2 fichiers queue.

### ✅ EPIC 4 — Script de publication (`publish.js`) + Docker
**Objectif :** conteneur capable de publier le prochain post de la queue sur un compte.
**Actions :**
1. `package.json` (dépendance : playwright), `publish.js` (logique §6, pseudo-code §7.1)
2. `Dockerfile` (§7.2) — image Playwright + chromium
3. `docker-compose.yml` (§7.3) — services one-shot `fb-account1`, `fb-account2` + service long-running `fb-monitor` (epic 6)
4. `docker compose build`
5. Test à blanc avec `DRY_RUN=1` (tout sauf le clic final "Publier") — sans cookies ça doit échouer proprement avec "Not logged in" + entrée `status:"error"` dans history

**Vérif :** build OK ; dry-run produit le bon post candidat dans les logs et une erreur propre "Not logged in".
**Détection reprise :** `docker images | grep fb-bot` + présence de `publish.js`.

### ⬜ EPIC 5 — Connexion manuelle + premier post réel (LE test critique)
**Objectif :** cookies persistés pour les 2 comptes, 1 post réel publié et visible sur chaque profil.
**⚠️ Nécessite Duy présent (login, éventuelle 2FA).**
**Actions :**
1. `scripts/login.js` : lance Playwright **headed** (via `xvfb-run` ou X11 forwardé — vérifier `echo $DISPLAY`) sur le profil persistant `cookies/account1/` ; Duy se connecte ; fermer → session sauvegardée
2. Idem account2
3. `docker compose run --rm fb-account1` → publication réelle du 1er post de la queue
4. **Vérifier sur Facebook** que le post est visible et bien formaté (retours à la ligne, accents)
5. Vérifier `history.jsonl` (entrée success + URL) et que la queue a perdu son 1er élément
6. Idem account2

**Vérif :** 2 posts réels visibles sur FB + 2 entrées success dans `history.jsonl` + queues à 115 entrées.
**Détection reprise :** `cookies/accountN/` non vide → login fait ; `wc -l data/history.jsonl` → nombre de publications déjà effectuées.

### 🔶 EPIC 6 — Monitoring + alertes email
**Objectif :** email automatique si échec de publication ou silence > 48h.
**Actions :**
1. `monitoring/monitor.js` (§7.4) : toutes les heures, lit `history.jsonl` ; alerte si dernière entrée d'un compte > 48h OU dernier statut = error. Anti-spam : max 1 email/24h par type d'alerte
2. Config SMTP dans `.env` (Gmail + app password de Duy)
3. `docker compose up -d fb-monitor`
4. Test : envoyer un email de test + simuler une erreur (fausse entrée error dans history) → email reçu

**Vérif :** email de test reçu dans la boîte de Duy ; `docker ps` montre fb-monitor Up.
**Détection reprise :** `docker ps | grep fb-monitor`.

### 🔶 EPIC 7 — Cron + backup cookies + sync auto du corpus
**Objectif :** automatisation complète, plus aucune intervention.
**Actions :**
1. `scripts/daily-publish.sh` : jitter aléatoire 0-45 min (`sleep $((RANDOM % 2700))`) puis `docker compose run --rm fb-account1` ; pareil account2 à un autre horaire
2. `scripts/backup-state.sh` : tar mensuel de `cookies/ data/ logs/` → `backups/fb-bot-state-YYYYMM.tar.gz` (garder 12 derniers)
3. `scripts/check-corpus.sh` (D14, spec §7.5) : compare le hash des `.md` du site au hash stocké dans `posts.json` ; si différent → relance `sync-posts.sh` + nettoie les queues (slugs disparus) + log signalé par le monitor
4. Crontab :
   ```cron
   0 9   * * * /home/dang/fb-bot/scripts/check-corpus.sh  >> /home/dang/fb-bot/logs/cron.log 2>&1
   15 10 * * * /home/dang/fb-bot/scripts/daily-publish.sh account1 >> /home/dang/fb-bot/logs/cron.log 2>&1
   30 18 * * * /home/dang/fb-bot/scripts/daily-publish.sh account2 >> /home/dang/fb-bot/logs/cron.log 2>&1
   0 3 1 * *  /home/dang/fb-bot/scripts/backup-state.sh >> /home/dang/fb-bot/logs/cron.log 2>&1
   ```
   (check-corpus à 9h, AVANT les publications du jour → un texte corrigé la veille part corrigé)
5. Test : lancer `daily-publish.sh` à la main (avec jitter court) → post publié ; modifier un texte côté site + lancer `check-corpus.sh` → posts.json régénéré + signalement
6. **Vérification J+1 :** le lendemain, contrôler que les 2 posts sont partis automatiquement

**Vérif :** `crontab -l | grep fb-bot` → 4 lignes ; publications automatiques constatées à J+1 ; test de sync concluant.
**Détection reprise :** `crontab -l | grep fb-bot`.

### ✅ EPIC 8 — CLI de gestion (confort, optionnel)
**Objectif :** consulter/gérer sans éditer les JSON à la main.
**Actions :** `cli.js` avec commandes :
- `status` — prochains posts de chaque queue, taille des queues, dernière publication
- `history [n]` — n dernières publications
- `skip <account>` — passer le prochain post
- `shuffle <account>` — mélanger la queue restante
- `push-front <account> <slug>` — prioriser un post

**Vérif :** `node cli.js status` affiche un état cohérent avec `history.jsonl`.

### ⬜ EPIC 9 — Rodage (2-4 semaines, passif)
**Objectif :** confirmer les hypothèses (§9) avant de déclarer le système stable.
**Actions :** ne rien faire, laisser tourner. Après 2 semaines : vérifier history (14 success/compte), les posts sur FB (pas masqués/spam), la validité des sessions.
**Vérif :** ≥ 13/14 success par compte sur 14 jours ; aucun avertissement FB sur les comptes.

---

## 3. PROTOCOLE DE REPRISE APRÈS CRASH

Nouvelle session Claude → exécuter dans l'ordre :

```bash
# 1. Le doc de référence (celui du repo bot fait foi s'il existe)
cat /home/dang/fb-bot/docs/PLAN.md 2>/dev/null || cat /home/dang/La-Revue-Aimer-sans-se-quitter/docs/FACEBOOK_BOT_AUTOMATION.md

# 2. État des epics (détection filesystem)
test -d /home/dang/fb-bot/.git && echo "EPIC1 ok"
node -e "console.log(require('/home/dang/fb-bot/data/posts.json').posts.length)" 2>/dev/null   # 116 → EPIC2 ok
ls /home/dang/fb-bot/data/queue-account*.json 2>/dev/null                                      # 2 fichiers → EPIC3 ok
docker images | grep fb-bot ; test -f /home/dang/fb-bot/publish.js                             # → EPIC4 ok
ls /home/dang/fb-bot/cookies/account1/ 2>/dev/null | head -3                                   # non vide → login fait
wc -l /home/dang/fb-bot/data/history.jsonl 2>/dev/null                                         # >0 → EPIC5 entamé/ok
docker ps | grep fb-monitor                                                                    # → EPIC6 ok
crontab -l | grep fb-bot                                                                       # 3 lignes → EPIC7 ok
git -C /home/dang/fb-bot log --oneline | head -10                                              # historique du travail
```

3. Croiser avec les cases cochées du §2 (le filesystem fait foi en cas de désaccord — mettre à jour les cases).
4. Reprendre à l'epic 🔶 ou au premier ⬜.
5. **Ne jamais re-exécuter l'EPIC 3 (init-queues) ni le login EPIC 5 si `history.jsonl` contient déjà des publications** — ça écraserait l'état réel.

---

## 4. ARCHITECTURE & ARBORESCENCE

```
/home/dang/fb-bot/                     ← repo git indépendant, dormant
├─ docs/PLAN.md                        ← CE document (copie de référence)
├─ README.md
├─ package.json
├─ publish.js                          ← cœur : publie le prochain post d'une queue
├─ cli.js                              ← consultation/gestion (epic 8)
├─ Dockerfile
├─ docker-compose.yml
├─ .env / .env.example                 ← SMTP, ALERT_EMAIL, TZ (.env gitignoré)
├─ scripts/
│  ├─ sync-posts.sh + extract-posts.js ← régénère posts.json depuis le repo site
│  ├─ check-corpus.sh                  ← cron quotidien 9h : détecte les changements du corpus et déclenche la sync (D14)
│  ├─ init-queues.js                   ← UNE SEULE FOIS (epic 3)
│  ├─ login.js                         ← connexion manuelle headed (epic 5, puis re-auth)
│  ├─ daily-publish.sh                 ← appelé par cron (jitter + docker compose run)
│  └─ backup-state.sh                  ← tar mensuel cookies+data+logs
├─ monitoring/monitor.js               ← sidecar long-running, alertes email
├─ data/                               ← ÉTAT PRÉCIEUX (committé sauf history? → committé aussi, cf. note)
│  ├─ posts.json                       ← corpus 116 posts (committé)
│  ├─ queue-account1.json              ← ordre à venir compte 1 (committé à l'init, évolue ensuite)
│  ├─ queue-account2.json
│  └─ history.jsonl                    ← append-only, toute la vie du bot
├─ cookies/account1/ , account2/       ← sessions Playwright persistantes (gitignoré, BACKUPÉ)
├─ logs/                               ← cron.log + logs détaillés (gitignoré)
└─ backups/                            ← tars mensuels (gitignoré)

/home/dang/La-Revue-Aimer-sans-se-quitter/   ← repo site : IGNORE l'existence du bot
```

**Flux quotidien :**
```
cron 9h00  → check-corpus.sh : corpus du site changé ? → régénère posts.json + nettoie queues (D14)
cron 10h15 → daily-publish.sh account1 → sleep jitter(0-45min)
  → docker compose run --rm fb-account1
     → publish.js : lit queue-account1.json[0] → charge le texte depuis posts.json
     → Playwright (contexte persistant cookies/account1/) → poste sur FB
     → succès : retire de la queue + append history.jsonl (+ resauve cookies)
     → queue vide après retrait → régénère la queue complète (cycle suivant, ordre de posts.json)
     → échec  : queue intacte, append history {status:"error"} → le monitor alertera
cron 18h30 → idem account2
```

---

## 5. FORMATS DE DONNÉES

### 5.1 `data/posts.json`
```json
{
  "metadata": { "total": 116, "generated": "<date sync>", "source": "aimer-sans-se-quitter/src/content/textes/", "sourceHash": "<sha256 des .md source — comparé par check-corpus.sh (D14)>", "version": 1 },
  "posts": [
    {
      "slug": "amour-presence-aime-toi-toi-meme-avant-d-aimer-l-autre",
      "title": "Aime-toi toi-même avant d'aimer l'autre",
      "content": "<texte intégral, markdown nettoyé pour FB : pas de #, pas de **>",
      "category": "amour-presence"
    }
  ]
}
```
Le `slug` est la clé universelle (queue ↔ posts ↔ history).

### 5.2 `data/queue-accountN.json`
```json
{
  "account": "account1",
  "cycle": 1,
  "updated": "2026-07-15T10:22:03Z",
  "queue": ["slug-suivant", "slug-d-apres", "..."]
}
```
- `queue[0]` = prochain post à publier. Publication OK → shift + history.
- **Modifier l'ordre = éditer ce fichier** (ou `cli.js shuffle/push-front`). Toujours valide tant que chaque slug existe dans posts.json (validation au démarrage de publish.js ; slug inconnu → erreur claire + email, pas de publication silencieusement ratée).
- Queue vide après un shift → `cycle+1`, queue régénérée = tous les slugs de posts.json dans l'ordre. **Garantit : les 116 sont tous publiés avant de reboucler.**
- **Effets de la sync auto (D14)** sur les queues :
  - Texte **modifié** → rien à faire (la queue référence le slug, le contenu vient de posts.json au moment de publier)
  - Texte **ajouté** → intégré au cycle suivant (ou tout de suite via `cli.js push-front`)
  - Texte **supprimé/renommé** → retiré automatiquement des queues par check-corpus.sh + signalé (jamais de blocage de publication)

### 5.3 `data/history.jsonl` (append-only, une ligne par tentative)
```json
{"ts":"2026-07-15T10:38:12Z","account":"account1","slug":"amour-presence-aime-toi...","cycle":1,"status":"success","fbUrl":"https://www.facebook.com/...","durationMs":8421}
{"ts":"2026-07-16T10:51:44Z","account":"account1","slug":"amour-presence-c-est-un-privilege...","cycle":1,"status":"error","error":"Not logged in — manual re-auth required"}
```
Sert à : historique consultable (`cli.js history`, grep), source unique du monitoring, stats.

---

## 6. MÉCANIQUE DE PUBLICATION — RÈGLES

1. **Un run = une tentative = une ligne dans history.** Pas de retry automatique dans le run (le cron du lendemain réessaiera le même post, resté en tête de queue). Simple et sans risque de double-post.
2. **Anti double-post :** au démarrage, publish.js vérifie dans history qu'il n'y a pas déjà un `success` pour ce compte aujourd'hui (date locale Europe/Paris) → sinon exit 0 silencieux. (Protège contre un cron doublé ou un run manuel oublié.)
3. **Texte publié = contenu brut du post**, markdown nettoyé (titres #, gras **, liens → texte). Titre en première ligne. Pas de variation artificielle (intros/emojis aléatoires) : les 2 comptes postant des textes différents et chaque texte ne revenant que tous les ~116 jours, le risque duplicate est faible. À réévaluer au rodage (§9).
4. **Comportement humain :** jitter cron 0-45 min ; frappe du texte avec `page.type()` et délais, pas un `fill()` instantané ; pauses aléatoires 1-3s entre les actions.
5. **Timezone :** tout en Europe/Paris (TZ dans .env et les conteneurs).

---

## 7. SPÉCIFICATIONS TECHNIQUES (pseudo-code de référence)

### 7.1 `publish.js` — logique
```
account = argv[2]                                  // "account1" | "account2"
posts   = load data/posts.json
queue   = load data/queue-<account>.json
valider : chaque slug de queue existe dans posts   // sinon: log error + exit 1
si history contient un success <account> aujourd'hui → exit 0

slug = queue.queue[0] ; post = posts[slug]
browser = chromium.launchPersistentContext("cookies/"+account, {
  headless: true, locale: "fr-FR", timezoneId: "Europe/Paris",
  args: ["--disable-blink-features=AutomationControlled"] })

goto facebook.com → vérifier logged-in (sinon: throw "Not logged in — manual re-auth required")
ouvrir le composer ("Quoi de neuf ...") → page.type(texte, {delay: 30-80ms})
si DRY_RUN → log le texte candidat, exit 0 SANS publier ni toucher la queue
clic Publier → attendre confirmation → récupérer l'URL du post

succès : queue.shift() ; si vide → régénérer (cycle+1) ; save queue
         append history {status:"success", fbUrl, ...}
échec  : append history {status:"error", error} ; exit 1   // queue INTACTE
```
⚠️ Les sélecteurs FB changent régulièrement — cibler par rôle/texte accessible (`getByRole`, aria-label FR) plutôt que par classes CSS, et prévoir 2-3 fallbacks.

### 7.2 `Dockerfile`
```dockerfile
FROM mcr.microsoft.com/playwright:v1.45.0-jammy   # chromium + deps inclus
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY publish.js cli.js ./
ENV TZ=Europe/Paris
# Pas de CMD par défaut utile : le compose fournit la commande
```

### 7.3 `docker-compose.yml` (points clés)
```yaml
services:
  fb-account1:            # ONE-SHOT — lancé par cron via `docker compose run --rm`
    build: .
    command: node publish.js account1
    restart: "no"         # ⚠️ surtout pas unless-stopped (D12)
    volumes: [./data:/app/data, ./cookies/account1:/app/cookies/account1, ./logs:/app/logs]
    env_file: .env
  fb-account2:            # idem, account2
    ...
  fb-monitor:             # LONG-RUNNING
    build: ./monitoring
    restart: unless-stopped
    volumes: [./data:/app/data:ro, ./logs:/app/logs:ro]
    env_file: .env
```

### 7.4 `monitoring/monitor.js`
- Toutes les heures : lire `history.jsonl`, pour chaque compte :
  - dernière entrée > 48h → alerte "silence"
  - dernière entrée = error → alerte "échec" (avec le message, ex. re-auth requise)
- Anti-spam : mémoriser la dernière alerte envoyée par (compte, type), max 1/24h.
- Email via nodemailer + SMTP Gmail (app password dans .env).
- Health check Docker du monitor : process vivant.

### 7.5 `scripts/check-corpus.sh` (sync auto quotidienne, D14)
```
HASH_ACTUEL = sha256 de la concaténation triée des .md de
              /home/dang/La-Revue-Aimer-sans-se-quitter/src/content/textes/
HASH_STOCKE = metadata.sourceHash de data/posts.json

si identiques → exit 0 (silencieux, cas de 99% des jours)
si différents :
  1. sync-posts.sh                      → régénère posts.json (avec le nouveau hash)
  2. pour chaque queue : retirer les slugs qui n'existent plus dans posts.json
  3. logger le diff (+N ajoutés / ~N modifiés / -N retirés) dans logs/ + history.jsonl
     {type:"corpus-sync", ...} → repris dans le prochain email du monitor
si le dossier source est INACCESSIBLE (disque, déplacement du repo site) :
  → exit 0 SANS toucher posts.json (le bot continue sur son corpus committé)
  → logger un warning (le monitor le signalera) — la sync ne doit JAMAIS casser la publication
```

### 7.6 Re-authentification (opération de maintenance récurrente)
Symptôme : email "Not logged in — manual re-auth required".
```bash
cd /home/dang/fb-bot
node scripts/login.js account1     # headed via xvfb-run ou ssh -X ; Duy se reconnecte ; fermer
docker compose run --rm fb-account1   # relance immédiate — le post en attente part
```
Fréquence attendue : tous les 2-3 mois par compte. C'est la SEULE intervention prévue en régime de croisière.

---

## 8. MAINTENANCE LONG TERME (10 ANS)

**Mensuel (automatique) :** backup tar de `cookies/ data/ logs/` (cron, epic 7).

**Annuel (manuel, ~15 min) :**
```bash
cd /home/dang/fb-bot
grep -c '"status":"success"' data/history.jsonl        # ~730/an attendu (2 comptes)
grep '"status":"error"' data/history.jsonl | tail -20  # inspecter les échecs
docker ps | grep fb-monitor ; crontab -l | grep fb-bot # les moteurs tournent
ls -la backups/ | tail -3                              # les backups se font
```
Mise à jour Playwright : **seulement si ça casse** (les sélecteurs FB sont le point fragile, pas la lib). Never touch a running system.

**Problèmes courants :**

| Symptôme | Cause probable | Remède |
|---|---|---|
| Email "Not logged in" | Session expirée / FB a déconnecté | `scripts/login.js` (§7.6) |
| Email "silence 48h" | Cron mort, serveur rebooté, Docker down | `crontab -l`, `docker ps`, relancer monitor |
| Erreur "selector not found" | FB a changé son UI | Mettre à jour les sélecteurs dans publish.js (session Claude dans /home/dang/fb-bot) |
| Post publié mais absent du fil | Filtrage FB (spam/duplicate) | Espacer (1 post/2j), réintroduire variations, voir §9 |
| Checkpoint FB / compte restreint | Détection automatisation | STOP le cron, laisser reposer 1-2 semaines, repartir headed + comportement + humain |

---

## 9. RISQUES & HYPOTHÈSES À VALIDER AU RODAGE

1. **Détection anti-bot FB** — le risque n°1. Mitigations en place : IP résidentielle stable, contexte persistant, jitter horaire, frappe humaine, 1 post/jour seulement. Plan B si détection : mode headed permanent sous xvfb ; plan C : espacer les publications. **Accepter qu'un bannissement de compte reste possible — FB interdit l'automatisation des profils perso dans ses CGU. Duy en est informé ; comptes = les siens.**
2. **Durée de vie des cookies** — inconnue (estimation 2-3 mois). Mesurée pendant le rodage ; le système est conçu pour que l'expiration soit un non-événement (email → 5 min de re-auth).
3. **Re-publication du même texte à ~116 jours** — probablement OK (dates différentes). Si filtrage constaté : réactiver l'idée v1 des variations légères (intro/emoji) — code prévu pour l'accueillir facilement (fonction de rendu du texte isolée).
4. **Évolution de l'UI Facebook** — certaine sur 10 ans. C'est LA maintenance imprévisible : compter 1-2 réparations de sélecteurs par an, ~30 min chacune avec Claude.

---

## 10. CE QUI A ÉTÉ ÉCARTÉ (et pourquoi — ne pas re-proposer sans nouveau contexte)

- **API Graph Facebook** : ne couvre pas les profils perso (D1)
- **Cloud / VPS externe** : IP datacenter plus suspecte, coût, dépendance (D2)
- **Même repo que le site** : couplage avec un repo actif, risque `git clean` sur les cookies, migrations Astro (D4)
- **SQLite / dashboard web** : sur-dimensionné pour 116 posts, pièces mobiles en plus (D8)
- **Formule stateless `jour % 116`** : interdit la gestion d'ordre et l'historique demandés (D7)
- **BMAD** : cérémonie sans valeur ajoutée à cette échelle (D13)
- **Hook pre-commit dans le repo site pour la sync** : couplerait le site au bot (risque de bloquer les commits du site), ne voit pas les modifs non committées, immédiateté inutile pour 1 post/jour → remplacé par check-corpus.sh quotidien côté bot (D14)
- **Variations automatiques du texte (v1)** : reportées — inutiles a priori avec 2 queues distinctes ; réintroduire seulement si le rodage montre du filtrage (§9.3)

---

*Doc v2.0 — 2026-07-05. Remplace intégralement la v1. Toute décision nouvelle prise en session doit être ajoutée au tableau §1 et ce doc recopié vers `/home/dang/fb-bot/docs/PLAN.md` s'il existe déjà.*
