جمهوری مسخره‌ها — نسخه Cinematic 12

ساختار:
index.html
style.css
data.js
ai.js
realtime.js
office3d.js
game.js
worker.js

راه‌اندازی در Acode:
1) همه فایل‌ها را داخل یک پوشه قرار بده.
2) index.html را Save کن.
3) index.html را Preview کن.
4) اگر AI یا Supabase در دسترس نبود، بازی باید در حالت محلی ادامه پیدا کند.

آنلاین:
- realtime.js از Supabase Realtime استفاده می‌کند.
- ai.js به Worker وصل می‌شود.
- worker.js فقط قالب Worker است و HF_TOKEN باید به صورت Secret در Cloudflare تنظیم شود؛ توکن داخل پروژه قرار داده نشده است.

نکته:
این نسخه عمداً بدون Three.js ساخته شده تا روی موبایل روان‌تر باشد؛ صحنه دفتر با CSS متحرک است.
