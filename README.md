# Zabezpieczenie panelu administracyjnego

Ten repo zawiera statyczną stronę i prosty panel admina. W repo nie powinno się przechowywać tajnych danych ani plików konfiguracyjnych zawierających hashe/salt do uwierzytelniania.

Co zrobiłem:
- Usunąłem `auth-config.json` z katalogu projektu (plik nie powinien być w publicznym katalogu ani w repo).
- Dodałem `/.gitignore`, aby zapobiec przypadkowemu dodaniu `auth-config.json` w przyszłości.

Szybkie rekomendacje (najpierw wykonaj lokalnie testy):

1) Szybkie zabezpieczenie bez backendu — Basic Auth na warstwie serwera

- Nginx (przykład):

```
# wygeneruj plik z hasłami
sudo apt-get install -y apache2-utils
htpasswd -c /etc/nginx/.htpasswd admin

# konfiguracja serwera (fragment)
location /panel.html {
  auth_basic "Restricted";
  auth_basic_user_file /etc/nginx/.htpasswd;
}
```

- Apache (przykład):

```
# wygeneruj plik htpasswd
sudo apt-get install -y apache2-utils
htpasswd -c /etc/apache2/.htpasswd admin

<Location "/panel.html">
  AuthType Basic
  AuthName "Restricted"
  AuthUserFile /etc/apache2/.htpasswd
  Require valid-user
</Location>
```

Uwaga: Basic Auth chroni dostęp do pliku na poziomie serwera — to szybkie rozwiązanie dla statycznego hostingu (jeśli hosting to obsługuje).

2) Zalecane — sesje po stronie serwera

- Wdrożenie endpointu `POST /login` na serwerze, weryfikacja hasła po stronie serwera, ustawienie ciasteczka `Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict`.
- Frontend sprawdza sesję przez `fetch('/api/me', { credentials: 'include' })` i na tej podstawie pokazuje/ukrywa UI panelu.

3) Nagłówki bezpieczeństwa (przykład konfiguracji serwera)

```
# Content Security Policy (dopasuj do własnych potrzeb)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;";
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header Referrer-Policy no-referrer-when-downgrade;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
```

4) Jeśli plik `auth-config.json` był już skomitowany do historii Gita — wyczyść historię i zrotuj poświadczenia

- Proste polecenia (usuń plik z obecnego commit i wypchnij):

```
git rm --cached auth-config.json || true
echo "auth-config.json" >> .gitignore
git add .gitignore
git commit -m "Remove auth-config.json from repo and add to .gitignore"
git push origin main
```

- Aby usunąć plik z historii (zalecane jeśli plik zawierał tajne dane): użyj `git filter-repo` lub `BFG` (przykład z BFG):

```
# zainstaluj bfg i uruchom
bfg --delete-files auth-config.json
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

Uwaga: czyszczenie historii wpływa na historię repozytorium — wszystkie współpracujące kopie będą wymagały ponownego sklonowania lub przystosowania.


5) Rotacja i generowanie haseł

- Jeśli usunąłeś plik z hashem z repo — wygeneruj nowe hasło na serwerze i przechowuj jedynie po stronie serwera (nie w repo). Jeśli chcesz, mogę wygenerować nowy salt/hash i przekazać instrukcję bez zapisywania go w repo.

6) Tryb demonstracyjny (lokalny)

- Dla wygody demo dodałem `auth-config.sample.json` z domyślnym użytkownikiem `admin` i hasłem `admin` (zahashowanym). Ten plik służy TYLKO do testów lokalnych.
- Aby przywrócić działanie panelu lokalnie, skopiuj plik `auth-config.sample.json` do `auth-config.json` w katalogu projektu (nie dodawaj go do repo):

```
cp auth-config.sample.json auth-config.json

# (opcjonalnie) upewnij się, że auth-config.json jest w .gitignore
```

 - Alternatywnie, skonfiguruj Basic Auth lub backendową weryfikację (zalecane dla środowisk publicznych).

6) Dalsze kroki, które mogę wykonać teraz (wybierz):
- A. Wyczyścić historię Gita (BFG/git filter-repo) i zforce'ować push (potrzebna Twoja zgoda).  
- B. Dodać do README dodatkowe przykłady endpointów serwerowych (Node/Express) dla sesji i `login` (jeśli chcesz backend).  
- C. Jedynie zatwierdzić zmiany i pozostawić dalsze kroki Tobie.

Jeśli chcesz, wykonam teraz krok A (czyszczenie historii) — potwierdź, że chcesz force-push (zmiana historii). Jeśli nie — mogę po prostu zatwierdzić i pushować obecne zmiany.
