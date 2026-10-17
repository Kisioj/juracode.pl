# juracode.pl – strona wizytówka JuraCode

Statyczna strona (HTML + CSS + vanilla JS, bez frameworków i build-stepu) w dwóch językach,
hostowana na Cloudflare Pages. Formularz kontaktowy działa przez Web3Forms,
poczta `kontakt@juracode.pl` jest przekierowywana na `juracode@gmail.com`.

```
public/                              ← tylko ten katalog trafia na Cloudflare Pages
├── index.html                       /                                 PL – strona główna
├── polityka-prywatnosci/            /polityka-prywatnosci/            PL – polityka serwisu
├── polityka-prywatnosci-aplikacji/  /polityka-prywatnosci-aplikacji/  PL – polityka aplikacji (Google Play)
├── usuwanie-danych/                 /usuwanie-danych/                 PL – usuwanie konta (Google Play)
├── en/
│   ├── index.html                   /en/                              EN – strona główna
│   ├── privacy-policy/              /en/privacy-policy/               EN – polityka serwisu
│   ├── app-privacy-policy/          /en/app-privacy-policy/           EN – polityka aplikacji (Google Play)
│   └── data-deletion/               /en/data-deletion/                EN – usuwanie konta (Google Play)
├── 404.html, robots.txt, sitemap.xml
├── _headers                         nagłówki bezpieczeństwa i cache (Cloudflare Pages)
└── assets/ (css, js, img)
```

Jak to działa:

```
Odwiedzający ──► juracode.pl (Cloudflare Pages)
                     │ formularz
                     ▼
                 Web3Forms ─────────────────────────────► juracode@gmail.com
Ktoś pisze na kontakt@juracode.pl ─► Cloudflare Email Routing ─┘
Ty odpowiadasz z Gmaila "jako kontakt@juracode.pl" ─► smtp.gmail.com ─► odbiorca
```

DNS domeny przenosimy z OVH do Cloudflare (darmowy plan). Domena dalej jest
zarejestrowana i opłacana w OVH – zmieniają się tylko serwery DNS. Bez tego Cloudflare
Pages nie obsłuży adresu bez `www` (`juracode.pl`), a Email Routing nie zadziała.

---

## Krok 1. Dane firmy (uzupełnia Claude)

Na stronach jest pełna nazwa firmy **JURACODE Krzysztof Jura** (jak w CEIDG – musi się zgadzać
z numerem D-U-N-S i danymi w Google Play Console), **NIP 5732826452** i **REGON 387212788**.
Adres firmy (ul. gen. Leopolda Okulickiego 53 lok. 32, 42-218 Częstochowa) jest podany w sekcji kontaktowej, w danych
dla Google i w politykach prywatności – wymaga tego ustawa o świadczeniu usług drogą elektroniczną.
W stopce są tylko nazwa, NIP i REGON. Klucz Web3Forms jest wpisany w oba formularze.

Podgląd lokalny: `python3 -m http.server 8000 -d public` → http://localhost:8000
(formularz zadziała dopiero z prawdziwym kluczem).

## Krok 2. Klucz Web3Forms (formularz kontaktowy)

Formularz „Juracode - kontakt” jest założony na koncie Web3Forms kisioj@gmail.com, a jego klucz
jest wpisany w `public/index.html` i `public/en/index.html`. Odbiorcę wiadomości ustawiasz w panelu
Web3Forms: **Linked Emails** (dodaj i potwierdź adres) → formularz → **Settings** → adres odbiorcy.

Klucz jest jawny (widać go w HTML) – tak ma być, służy tylko do wskazania, gdzie wysłać wiadomość.
Przed spamem chroni ukryte pole `botcheck`. Darmowy plan: 250 wiadomości/miesiąc.

## Krok 3. Konto Cloudflare i dodanie domeny

1. Załóż konto na https://dash.cloudflare.com/sign-up (najlepiej na juracode@gmail.com, włącz 2FA).
2. **Add a domain** → wpisz `juracode.pl` → zostaw szybkie skanowanie rekordów DNS → plan **Free**.
3. Cloudflare zaimportuje rekordy z OVH. **Usuń wszystkie zaimportowane rekordy** (A `213.186.33.5`,
   CNAME `ftp`, TXT `1|www.juracode.pl` i `3|welcome`, MX `mx1/mx2.mail.ovh.net`,
   SPF `include:mx.ovh.com` oraz rekordy z drugiej strony listy – `autodiscover`, `mail`, `smtp` itp.).
   To ustawienia parkingu i poczty OVH, z których nie korzystasz. Właściwe rekordy dodadzą się same w krokach 5–6.
4. Cloudflare pokaże **dwa serwery nazw**, np. `xxx.ns.cloudflare.com` i `yyy.ns.cloudflare.com` – zapisz je.

## Krok 4. Zmiana serwerów DNS w OVH

1. OVH → Web Cloud → **Domain names** → `juracode.pl`.
2. Jeśli w zakładce **General information** włączony jest **DNSSEC** – wyłącz go
   (przy zmianie DNS włączony DNSSEC zablokuje domenę). Można go później włączyć ponownie w Cloudflare.
3. Zakładka **DNS servers** → **Modify DNS servers** → zamiast `dns103.ovh.net` / `ns103.ovh.net`
   wpisz dwa serwery z Cloudflare → **Apply configuration**.
4. Czekaj na maila od Cloudflare, że domena jest aktywna (zwykle od kilkunastu minut do kilku
   godzin, maksymalnie 24–48 h). Strefa DNS w OVH przestanie mieć znaczenie – możesz ją zostawić.

## Krok 5. Publikacja strony na Cloudflare Pages (połączenie z GitHubem)

Kod jest w repo https://github.com/Kisioj/juracode.pl (gałąź `main`). Cloudflare Pages pobiera go
z GitHuba i publikuje stronę automatycznie po każdym pushu – wystarczy jednorazowo połączyć:

1. Cloudflare → **Workers & Pages** → **Create** → zakładka **Pages** → **Import an existing Git repository**
   (jeśli kreator proponuje Workers, kliknij link do Pages, np. „Looking to deploy Pages? Get started”).
2. **Connect GitHub** → zaloguj się jako **Kisioj** → zainstaluj aplikację Cloudflare
   (wystarczy dostęp tylko do repozytorium `juracode.pl`).
3. Wybierz repo `Kisioj/juracode.pl` → **Begin setup**:
   - Project name: `juracode`
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: *(puste)*
   - Build output directory: `public`
4. **Save and Deploy**.

Od teraz każda zmiana wypchnięta na `main` trafia na stronę w ~1 minutę, a zmiany na innych gałęziach
dostają podglądowy adres `*.juracode.pages.dev`.

Strona będzie dostępna pod `https://juracode.pages.dev`. Teraz domena:

1. Projekt `juracode` → **Custom domains** → **Set up a custom domain** → `juracode.pl` → **Activate domain**.
2. To samo dla `www.juracode.pl`.
3. Przekierowanie `www` → bez `www`: w panelu domeny `juracode.pl` → **Rules** → **Redirect Rules**
   → **Create rule** → szablon **„Redirect from WWW to root”** → **Deploy**.
4. **SSL/TLS** → **Edge Certificates** → włącz **Always Use HTTPS**.

Sprawdź: https://juracode.pl, https://www.juracode.pl (ma przekierować) i https://juracode.pl/en/.

## Krok 6. Poczta kontakt@juracode.pl → Gmail (Cloudflare Email Routing)

1. Panel domeny `juracode.pl` → **Email** → **Email Routing** → **Get started**.
2. **Custom address**: `kontakt` → **Destination**: `juracode@gmail.com` → **Create and continue**.
3. Na Gmaila przyjdzie mail weryfikacyjny od Cloudflare – kliknij link.
4. **Add records and enable** – Cloudflare doda rekordy MX, SPF i DKIM.
5. (Opcjonalnie) **Routing rules** → **Catch-all** → *Send to an email* → `juracode@gmail.com`,
   żeby trafiała do Ciebie też poczta wysłana np. na `biuro@` lub z literówką.

Test: wyślij maila na `kontakt@juracode.pl` **z innego konta** (np. służbowego lub z telefonu).
Wiadomość wysłana z samego juracode@gmail.com może nie pojawić się w Odebranych – Gmail traktuje ją jak duplikat.

## Krok 7. SPF i DMARC (żeby Twoje maile nie lądowały w spamie)

W panelu Cloudflare → **DNS** → **Records**:

1. **Edytuj** istniejący rekord TXT dla `juracode.pl` zaczynający się od `v=spf1` (nie dodawaj drugiego!) na:
   ```
   v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
   ```
2. **Dodaj** rekord TXT o nazwie `_dmarc` i treści:
   ```
   v=DMARC1; p=none;
   ```
   Zostaw `p=none` – maile wysyłane przez serwery Gmaila są podpisywane domeną gmail.com,
   więc ostrzejsza polityka (`quarantine`/`reject`) powodowałaby odrzucanie Twoich własnych wiadomości.

## Krok 8. Wysyłanie z Gmaila jako kontakt@juracode.pl

1. Włącz weryfikację dwuetapową na koncie juracode@gmail.com: https://myaccount.google.com/security
2. Utwórz **hasło aplikacji**: https://myaccount.google.com/apppasswords → nazwa np. „Gmail SMTP juracode”
   → skopiuj 16-znakowy kod (bez spacji).
3. Gmail w przeglądarce → ⚙ → **Zobacz wszystkie ustawienia** → **Konta i importowanie**
   → **Wysyłaj pocztę jako** → **Dodaj inny adres e-mail**:
   - Nazwa: `JuraCode` (albo np. `Krzysztof Jura | JuraCode`)
   - Adres: `kontakt@juracode.pl`, zostaw zaznaczone „Traktuj jako alias”
   - Serwer SMTP: `smtp.gmail.com`, port `587`
   - Nazwa użytkownika: `juracode@gmail.com`
   - Hasło: **hasło aplikacji** z punktu 2
   - Połączenie zabezpieczone **TLS**
4. Gmail wyśle kod potwierdzający na `kontakt@juracode.pl` – dzięki krokowi 6 przyjdzie on do tej samej skrzynki. Kliknij link.
5. W **Konta i importowanie** ustaw `kontakt@juracode.pl` jako **domyślny** i zaznacz
   **„Odpowiadaj z tego samego adresu, na który wysłano wiadomość”**.
6. (Opcjonalnie) Filtr `to:kontakt@juracode.pl` → etykieta „JuraCode”.

> Niektórzy odbiorcy mogą zobaczyć przy nadawcy dopisek „przez gmail.com”. To normalne przy tym
> darmowym rozwiązaniu. Jeśli kiedyś będzie przeszkadzać – Google Workspace albo zewnętrzny serwer SMTP
> z podpisem DKIM dla juracode.pl (np. Brevo) usuwa ten dopisek, a logujesz się dalej przez Gmaila.

## Krok 9. Testy

- [ ] https://juracode.pl i https://juracode.pl/en/ działają, `www` przekierowuje, kłódka HTTPS jest.
- [ ] Przełącznik PL/EN w nagłówku prowadzi do odpowiednika strony w drugim języku.
- [ ] Formularz po polsku i po angielsku: po wysłaniu jest komunikat „Dziękujemy!” / „Thank you!”,
      a wiadomość przychodzi na Gmaila (temat zawiera `[PL]` lub `[EN]`; „Odpowiedz” trafia do nadawcy formularza).
- [ ] Mail z zewnętrznego konta na `kontakt@juracode.pl` dochodzi do Gmaila.
- [ ] Odpowiedź z Gmaila wychodzi jako `kontakt@juracode.pl`; u odbiorcy w „Pokaż oryginał”
      SPF i DKIM mają status PASS.
- [ ] (Opcjonalnie) https://pagespeed.web.dev – strona nie ładuje żadnych zewnętrznych zasobów, więc wynik powinien być bardzo wysoki.

## Krok 10. Google Search Console (widoczność w Google)

1. https://search.google.com/search-console → **Dodaj usługę** → typ **Domena** → `juracode.pl`.
2. Weryfikacja przez rekord TXT – Search Console wykrywa Cloudflare i może dodać rekord automatycznie
   (albo dodaj go ręcznie w Cloudflare → DNS).
3. **Mapy witryn** → dodaj `https://juracode.pl/sitemap.xml`.

Ta weryfikacja przyda się też w Google Play Console (potwierdzenie strony organizacji).
Strona ma już: tytuły i opisy dla każdej strony, `canonical`, pary językowe `hreflang` (PL ↔ EN),
dane strukturalne Organization, sitemap i robots.txt. Adres `*.pages.dev` jest wyłączony z indeksowania.

## Krok 11. Konto organizacji w Google Play

1. **Numer D-U-N-S** (darmowy) – zamów przez Dun & Bradstreet (https://www.dnb.com/duns-number.html).
   Może to potrwać do ~30 dni. Nazwa i adres muszą być **identyczne** jak w CEIDG.
2. https://play.google.com/console/signup → **Organizacja** → opłata 25 USD.
3. Dane w formularzu:
   - D-U-N-S, pełna nazwa i adres firmy (jak w CEIDG),
   - strona internetowa: `https://juracode.pl`,
   - publiczny e-mail kontaktowy dewelopera: `kontakt@juracode.pl` (kod weryfikacyjny przyjdzie na Gmaila),
   - telefon (zostanie zweryfikowany SMS-em).
4. Jeśli konsola poprosi o potwierdzenie własności strony – użyj Search Console z kroku 10.

Uwaga: jeśli zarabiasz na aplikacjach w UE, Google Play (zgodnie z DSA) pokazuje użytkownikom dane
kontaktowe „przedsiębiorcy”, w tym adres. Jeśli nie chcesz pokazywać adresu domowego, rozważ adres
wirtualnego biura zarejestrowany w CEIDG.

Konta organizacji nie obejmuje wymóg testów zamkniętych (12 testerów przez 14 dni),
który dotyczy nowych kont osobistych. Do sprzedaży płatnych aplikacji ustawisz jeszcze profil płatności
(konto bankowe firmy) – rozliczenia warto skonsultować z księgową.

## Przy publikacji każdej aplikacji

W Play Console → **Treść aplikacji**:

- **Polityka prywatności**: `https://juracode.pl/en/app-privacy-policy/`
  (lub wersja polska `https://juracode.pl/polityka-prywatnosci-aplikacji/`)
- **Usuwanie konta** (wymagane, jeśli aplikacja pozwala założyć konto): `https://juracode.pl/en/data-deletion/`
- **Bezpieczeństwo danych** (Data safety) – odpowiedzi muszą się zgadzać z polityką.

Przed publikacją dopisz aplikację do tabeli w punkcie 6 **obu** polityk aplikacji
(`public/polityka-prywatnosci-aplikacji/index.html` i `public/en/app-privacy-policy/index.html` –
w kodzie jest gotowy szablon wiersza w komentarzu), zaktualizuj datę „Ostatnia aktualizacja”
i opublikuj stronę ponownie – wystarczy dać Claude'owi nazwę aplikacji, nazwę pakietu
i listę użytych usług (reklamy, analityka, zakupy itd.).

Polityka aplikacji opisuje typowe funkcje (zakupy Google Play, Crashlytics, Analytics, AdMob,
Play Games). Jeśli aplikacja używa czegoś spoza tej listy – dopisz to do polityki. Zwróć uwagę na
zobowiązania z polityki: statystyki (Analytics) tylko po zgodzie użytkownika, a reklamy spersonalizowane
tylko po zgodzie zebranej formularzem Google UMP. Jeśli używasz AdMob, dodaj też plik `public/app-ads.txt`.

## Utrzymanie

- Wspólny nagłówek i stopka są skopiowane w każdym pliku HTML (bez build-stepu) – zmieniając menu
  lub stopkę, popraw wszystkie strony. Pamiętaj o obu wersjach językowych.
- Dodając nową podstronę: dopisz ją do `sitemap.xml` (z parą `hreflang`) i dodaj w `<head>` linki
  `canonical` oraz `alternate hreflang` wskazujące na odpowiednik w drugim języku.
- Gdybyś dodał analitykę (np. Cloudflare Web Analytics – bez cookies), zaktualizuj punkt o cookies
  w politykach prywatności serwisu. Nagłówek CSP w `public/_headers` już ją dopuszcza;
  inne zewnętrzne skrypty trzeba będzie tam dopisać.
- Wzory polityk są przygotowane rzetelnie, ale nie są poradą prawną. Przy bardziej rozbudowanych
  aplikacjach (konta użytkowników, płatności poza Google Play, dane wrażliwe) warto dać je do przejrzenia prawnikowi.
