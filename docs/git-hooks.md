# Git Hooks – Build-Sicherung

## Überblick

Dieses Projekt nutzt Git Hooks, um sicherzustellen, dass Build-Artefakte (`build/`, `admin/build/`) immer aktuell sind, bevor Code gepusht wird.

## Verfügbare Hooks

### Pre-Push Hook (empfohlen, aktiv)

**Datei:** `.git/hooks/pre-push`

Wird automatisch vor jedem `git push` ausgeführt:

1. Prüft, ob Source-Dateien (`src/`, `admin/src/`) seit dem letzten Push geändert wurden
2. Falls ja → führt `npm run build` aus
3. Vergleicht, ob die Build-Dateien zum letzten Commit passen
4. Falls nicht aktuell → **Push wird blockiert** mit Anweisungen

**Workflow:**
```bash
git add src/app/myFile.ts
git commit -m "feat: new feature"
git push                          # → Hook baut und prüft automatisch
```

Falls der Build nicht gestaged ist:
```bash
# Hook meldet: "Build output is not up to date!"
git add build/ admin/build/
git commit --amend --no-edit      # Build-Dateien zum letzten Commit hinzufügen
git push
```

### Pre-Commit Hook (optional, langsamer)

**Datei:** `.git/hooks/pre-commit`

Wird vor jedem `git commit` ausgeführt:

1. Prüft, ob Source-Dateien gestaged sind
2. Falls ja → führt `npm run build` aus
3. Staged automatisch `build/` und `admin/build/`
4. Build schlägt fehl → **Commit wird blockiert**

**Vorteil:** Jeder Commit ist garantiert buildbar.  
**Nachteil:** Jeder Commit dauert ~30–60 Sekunden länger.

## Einrichtung

Die Hooks liegen in `.git/hooks/` und werden **nicht** mit ins Repository committed. Bei einem frischen Clone müssen sie neu angelegt werden.

### Pre-Push Hook einrichten

Datei `.git/hooks/pre-push` erstellen mit folgendem Inhalt:

```sh
#!/bin/sh
REMOTE_REF=$(git rev-parse @{upstream} 2>/dev/null || echo "HEAD~1")
CHANGED_SRC=$(git diff --name-only "$REMOTE_REF" HEAD -- 'src/' 'admin/src/')

if [ -z "$CHANGED_SRC" ]; then
    exit 0
fi

echo "🔨 Source changes detected – running build before push..."
npm run build --silent 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before pushing."
    exit 1
fi

DIRTY_BUILD=$(git status --porcelain -- 'build/' 'admin/build/')
if [ -n "$DIRTY_BUILD" ]; then
    echo "⚠️  Build output is not up to date!"
    echo "   Run: git add build/ admin/build/ && git commit --amend --no-edit && git push"
    exit 1
fi

echo "✅ Build is up to date – pushing."
exit 0
```

### Pre-Commit Hook einrichten (optional)

Datei `.git/hooks/pre-commit` erstellen mit folgendem Inhalt:

```sh
#!/bin/sh
STAGED_SRC=$(git diff --cached --name-only -- 'src/' 'admin/src/')

if [ -z "$STAGED_SRC" ]; then
    exit 0
fi

echo "🔨 Source changes detected – running build..."
npm run build --silent 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix build errors before committing."
    exit 1
fi

git add build/ admin/build/
echo "✅ Build complete – build files auto-staged."
exit 0
```

## Hook überspringen

Falls nötig (z. B. bei Doku-Änderungen ohne Source-Änderungen), kann ein Hook übersprungen werden:

```bash
git push --no-verify
git commit --no-verify
```

## Nur einen Hook aktiv haben

- **Nur Pre-Push:** `pre-commit` Datei löschen oder umbenennen
- **Nur Pre-Commit:** `pre-push` Datei löschen oder umbenennen

```bash
# Beispiel: Pre-Commit deaktivieren
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

