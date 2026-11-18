# Deploy qo'llanmasi — tmk-frontend

Deploy **qo'lda** bajariladi. GitHub Actions faqat kod build bo'lishini
tekshiradi, serverga hech narsa yubormaydi — sababi pastda, «Nega avtomatik
emas» bo'limida.

## Server

| | |
|---|---|
| IP | `45.9.231.133` |
| SSH porti | `2005` |
| Foydalanuvchi | `root` |
| Manba kodi | `/opt/deploy/tmk-frontend` |
| Sayt papkasi | `/var/www/tmk-frontend/build` |
| nginx konfiguratsiyasi | `/etc/nginx/sites-available/tmk-front` |

`tmk.bgs.uz` DNS'i `84.54.118.59` ga ishora qiladi — bu **boshqa mashina**,
oldida turgan proxy. Deploy nishoni emas, ikkisini aralashtirmang.

## Odatiy deploy

Kod `main` ga push qilingandan keyin:

```bash
ssh -p 2005 root@45.9.231.133
tmk-frontend-deploy
```

Skript nima qiladi:

1. `/opt/deploy/tmk-frontend` da `git fetch` + `git reset --hard origin/main`
2. `npm ci` va `npm run build`
3. Natijani `build.new` ga qo'yadi
4. Ishlayotgan versiyani `build.old` ga ko'chiradi
5. `build.new` ni `build` qilib qo'yadi

Build **yon papkada** bajarilgani uchun, u yiqilsa ishlayotgan sayt
tegilmaydi. Almashtirish `mv` bilan bir lahzada bo'ladi, ya'ni saytda
uzilish bo'lmaydi.

nginx'ni qayta yuklash shart emas — statik fayllar papkadan to'g'ridan-to'g'ri
o'qiladi.

## Tekshirish

Brauzerda saytni **qattiq yangilash** bilan oching (`Cmd+Shift+R`), aks holda
eski fayllar keshdan ko'rinadi.

```bash
ls -l /var/www/tmk-frontend/build/index.html
```

Vaqti hozirgi bo'lishi kerak.

## Orqaga qaytarish

Deploy'dan keyin biror narsa buzilsa:

```bash
rm -rf /var/www/tmk-frontend/build
mv /var/www/tmk-frontend/build.old /var/www/tmk-frontend/build
```

`build.old` — oldingi ishlagan versiya. Har deploy'da yangilanadi, ya'ni
doim bitta qadam orqaga qaytish imkoni bor.

## Mumkin bo'lgan muammolar

**Xotira yetishmasligi** (`JavaScript heap out of memory`):

```bash
NODE_OPTIONS=--max-old-space-size=2048 tmk-frontend-deploy
```

**OpenSSL xatosi** (`error:0308010C:digital envelope routines::unsupported`) —
Node va `react-scripts` nomuvofiqligi:

```bash
NODE_OPTIONS=--openssl-legacy-provider tmk-frontend-deploy
```

**Sayt o'zgarmagandek ko'rinsa** — deyarli har doim brauzer keshi. Avval
qattiq yangilash, keyin `index.html` vaqtini tekshirish.

## Nega avtomatik emas

GitHub Actions runner'lari serverning SSH portiga ulana olmaydi. Tekshirildi:

- Serverda firewall yo'q — `ufw` o'chiq, `iptables` bo'sh, siyosat `ACCEPT`
- `45.9.231.133:2005` boshqa tarmoqlardan ochiq, SSH banner beradi
- SSH kaliti to'g'ri — tashqaridan sinab tasdiqlangan
- `SERVER_HOST`, `SERVER_SSH_PORT`, `SERVER_USER`, `SERVER_SSH_KEY` — hammasi to'g'ri
- Runner'dan (`48.217.180.129`, Microsoft AS8075) o'sha portga TCP timeout

Ya'ni provayder bulut IP diapazonlaridan SSH'ga kirishni tarmoq darajasida
filtrlaydi. Bu serverdan ham, GitHub'dan ham tuzatib bo'lmaydi.

Runner IP'sini oq ro'yxatga qo'shish yordam bermaydi — har ishga tushirishda
Microsoft'ning katta diapazonlaridan yangi IP keladi.

Avtomatik deploy'ni tiklash yo'llari, agar kerak bo'lsa:

- Provayderdan 2005-portni bulut diapazonlariga ochishni so'rash
- Tailscale — runner tarmoqqa qo'shiladi, scp ichki manzil orqali ketadi
- Self-hosted runner — serverning o'zida ishlaydi, inbound port kerak emas

SSH kaliti va GitHub secret'lari tayyor turibdi, shuning uchun tarmoq masalasi
hal bo'lgan kuni ularni qayta sozlash kerak bo'lmaydi.

## Serverni noldan sozlash

Agar server almashsa yoki skript yo'qolsa:

```bash
mkdir -p /opt/deploy
git clone https://github.com/Ilnur72/tmk-frontend.git /opt/deploy/tmk-frontend
```

So'ng `/usr/local/bin/tmk-frontend-deploy` faylini yarating:

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=/opt/deploy/tmk-frontend
TARGET=/var/www/tmk-frontend/build

cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main
echo ">>> commit: $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"

npm ci
npm run build

rm -rf "${TARGET}.new" "${TARGET}.old"
cp -a build "${TARGET}.new"
[ -d "$TARGET" ] && mv "$TARGET" "${TARGET}.old"
mv "${TARGET}.new" "$TARGET"

echo ">>> tayyor. Eski versiya: ${TARGET}.old"
```

```bash
chmod +x /usr/local/bin/tmk-frontend-deploy
```

Manba kodi `/var/www` dan **tashqarida** turishi muhim: `react-scripts build`
ishni `build/` papkasini tozalashdan boshlaydi, shuning uchun repo sayt
papkasida tursa, build davomida sayt o'chib qoladi va build yiqilsa buzilgan
holatda qoladi.
