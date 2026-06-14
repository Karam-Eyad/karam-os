# مسار (Masaar)

> نظّم مهامك وعاداتك ومشاريعك في مكان واحد

تطبيق ويب للإنتاجية الشخصية ثنائي اللغة (عربي/إنجليزي)، مبني بـ Next.js App Router مع Supabase كـ backend كامل.

- 🌐 **Production:** https://karam-os.vercel.app
- 📦 **Repository:** https://github.com/Karam-Eyad/karam-os

---

## Stack التقني

| الطبقة | التقنية |
|--------|---------|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Data Fetching | SWR v2 (client-side cache) |
| Hosting | Vercel (Hobby plan, maxDuration=60s) |
| AI | NVIDIA NIM — `meta/llama-3.1-8b-instruct` |
| Auth | Supabase Auth (email/password + Google OAuth) |

---

## الميزات

| الميزة | التفاصيل |
|--------|----------|
| 📋 **مهام اليوم** | فلترة ذكية: متأخرة + اليوم + مكتملة |
| 📅 **عرض أسبوعي** | تقويم 7 أيام مع إضافة مهام لكل يوم |
| 🗂️ **المشاريع** | نسبة إنجاز، ألوان، track |
| ✅ **العادات** | streak، ring، chart آخر 30 يوم، أيقونات |
| 💡 **الأفكار** | AI suggestions بالعربي/الإنجليزي، status workflow |
| 👥 **الفريق** | invite link، أعضاء، مهام مشتركة |
| 🔁 **تكرار المهام** | daily/weekly — occurrence جديدة تلقائياً عند الإتمام |
| 💬 **تعليقات** | على المهام |
| 🌙 **Dark / Light mode** | محفوظ في localStorage |
| 🌐 **AR / EN** | RTL/LTR تلقائي، اللغة محفوظة |

---

## هيكل المشروع

```
src/
├── app/
│   ├── (app)/                      # الصفحات المحمية (تحتاج login)
│   │   ├── layout.tsx              # يجلب user+profile، يغلّف بـ AppShell
│   │   ├── loading.tsx             # Skeleton أثناء التنقل بين الصفحات
│   │   ├── page.tsx                # اليوم      → TodayView
│   │   ├── week/page.tsx           # الأسبوع   → WeekView
│   │   ├── tasks/page.tsx          # كل المهام  → AllTasksView
│   │   ├── projects/page.tsx       # المشاريع   → ProjectsView
│   │   ├── habits/page.tsx         # العادات    → HabitsView
│   │   ├── ideas/page.tsx          # الأفكار    → IdeasView
│   │   ├── team/page.tsx           # الفريق     → TeamView
│   │   └── settings/page.tsx       # الإعدادات  → SettingsView
│   ├── api/ideas/suggest/route.ts  # POST — AI suggestions
│   ├── actions.ts                  # Server Actions (team, ideas, settings, auth)
│   ├── layout.tsx                  # Root layout (providers + i18n + theme)
│   └── login/ signup/ forgot-password/ join/[token]/ auth/callback/
│
├── components/
│   ├── AppShell.tsx                # Layout: sidebar ثابت (desktop) + drawer (mobile)
│   ├── Modal.tsx                   # Modal عام بـ React Portal
│   ├── TaskDialog.tsx              # إنشاء/تعديل مهمة
│   ├── TaskItem.tsx                # بطاقة مهمة مع optimistic toggle
│   ├── HabitDialog.tsx             # إنشاء/تعديل عادة (modal مدمج بـ portal)
│   ├── HabitItem.tsx               # بطاقة عادة مع ring + optimistic toggle
│   ├── HabitRing.tsx               # دائرة SVG لنسبة الإنجاز
│   ├── HabitCompletionChart.tsx    # رسم بياني 30 يوم
│   ├── ProjectDialog.tsx           # إنشاء/تعديل مشروع
│   ├── CommentSection.tsx          # تعليقات على المهام
│   ├── PageHeader.tsx              # رأس الصفحة المشترك
│   ├── icons.tsx                   # كل الأيقونات + HABIT_ICONS
│   ├── ui.tsx                      # Button, Input, Textarea, Select, Label
│   └── views/
│       ├── TodayView.tsx           # ملخص اليوم: المتأخرة + اليوم + العادات
│       ├── WeekView.tsx            # تقويم 7 أيام
│       ├── AllTasksView.tsx        # كل المهام مع فلاتر
│       ├── ProjectsView.tsx        # بطاقات المشاريع مع نسبة الإنجاز
│       ├── HabitsView.tsx          # العادات + chart + streak
│       ├── IdeasView.tsx           # مساحة الأفكار مع AI
│       ├── TeamView.tsx            # الفريق + invite link
│       └── SettingsView.tsx        # الإعدادات
│
└── lib/
    ├── hooks.ts                    # SWR hooks (useTasks, useProjects, useHabits…)
    ├── client-mutations.ts         # Supabase mutations مباشرة من المتصفح
    ├── types.ts                    # TypeScript types
    ├── date.ts                     # دوال التاريخ
    ├── clsx.ts                     # utility لدمج CSS classes
    ├── i18n/
    │   ├── context.tsx             # React context للغة (AR/EN)
    │   └── dictionaries.ts         # ترجمات AR + EN
    ├── theme/context.tsx           # Dark/Light mode context
    └── supabase/
        ├── client.ts               # Supabase browser client (singleton)
        ├── server.ts               # Supabase server client + getServerUser() مع cache()
        └── middleware.ts           # تجديد session token
```

---

## قاعدة البيانات (Supabase)

### الجداول

| الجدول | الحقول الرئيسية |
|--------|----------------|
| `profiles` | id, full_name, email, locale, email_reminders |
| `tasks` | id, user_id, title, description, due_date, priority, status, recurrence, project_id, team_id, completed_at |
| `projects` | id, user_id, name, track, color, team_id |
| `habits` | id, user_id, name, icon, color, frequency, sort_order |
| `habit_logs` | id, habit_id, user_id, completed_date (YYYY-MM-DD) |
| `ideas` | id, user_id, title, body, status, ai_suggestion |
| `teams` | id, owner_id, name |
| `team_members` | id, team_id, user_id, role (owner / editor) |
| `team_invites` | id, team_id, token (UUID) |
| `task_comments` | id, task_id, user_id, content |

### الـ Types الأساسية

```typescript
type Priority   = "high" | "medium" | "low"
type Status     = "todo" | "in_progress" | "done"
type Recurrence = "none" | "daily" | "weekly"
type IdeaStatus = "new" | "in_progress" | "done"
```

كل الجداول محمية بـ **Row Level Security (RLS)** — المستخدم يقرأ ويعدّل بياناته فقط عبر `auth.uid()`.

---

## معمارية البيانات — SWR Pattern

### المبدأ

لا يوجد data fetching على مستوى الصفحات. كل الصفحات المحمية هي wrappers بسيطة. البيانات تُجلب من داخل View components عبر SWR.

```
أول زيارة :  Browser → Supabase → SWR Cache
التنقل بعدها:  SWR Cache  (فوري، ~0ms)
أي mutation :  Browser → Supabase مباشرة → revalidate SWR Cache
```

### SWR Hooks — `src/lib/hooks.ts`

```typescript
useTasks()               // كل المهام مرتبة
useTodayTasks()          // مهام اليوم + المتأخرة
useProjects()            // كل المشاريع
useProjectsWithCounts()  // المشاريع مع عداد المهام المكتملة
useHabits(today)         // العادات + logs آخر 30 يوم
useHabitChartData(today) // بيانات الرسم البياني

// Cache invalidation بعد أي تعديل:
revalidateTasks()
revalidateProjects()
revalidateHabits(today)
```

### Client Mutations — `src/lib/client-mutations.ts`

```typescript
// Tasks
clientToggleTask(id, currentStatus, taskData)
clientCreateTask(data)
clientUpdateTask(id, data)
clientDeleteTask(id)

// Projects
clientCreateProject(data)
clientUpdateProject(id, data)
clientDeleteProject(id)

// Habits
clientCreateHabit(data)
clientUpdateHabit(id, data)
clientDeleteHabit(id)
clientToggleHabitLog(habitId, date, completed)
```

كل mutation تتصل بـ Supabase مباشرةً من المتصفح (بدون Vercel hop)، ثم تستدعي `revalidate*()` لتحديث الـ cache.

---

## Optimistic UI

`TaskItem` و `HabitItem` يحدّثان الشاشة فوراً بـ local state قبل أي رد من السيرفر:

```typescript
const [done, setDone] = useState(task.status === "done");

function handleToggle() {
  const prev = done;
  setDone(!prev);                                    // فوري على الشاشة
  clientToggleTask(...).catch(() => setDone(prev));  // revert عند خطأ
}
```

---

## Modal System

**جميع المودالات تستخدم React Portal** (`createPortal`) وتُرسم مباشرةً على `document.body`. هذا ضروري لأن `position: fixed` يتكسر حين يكون أي عنصر parent يحمل `transform` أو `backdrop-filter`.

```typescript
// Modal.tsx
return createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl ..."
         style={{ maxHeight: "calc(100dvh - 2rem)" }}>
      <div className="shrink-0 ...">/* header ثابت */</div>
      <div className="overflow-y-auto ...">/* body يسكرول */</div>
    </div>
  </div>,
  document.body
);
```

---

## Server Actions المتبقية — `src/app/actions.ts`

تُستخدم فقط للعمليات التي لا تحتاج تحديث SWR cache:

- **Team:** createTeam, joinTeamByToken, removeMember, regenerateInviteToken
- **Comments:** addComment, deleteComment
- **Ideas:** createIdea, deleteIdea, updateIdeaStatus, saveIdeaSuggestion, convertIdeaToProject
- **Settings:** updateProfile
- **Auth:** signOut

> ⚠️ تستخدم `getSession()` (قراءة محلية من cookie) بدلاً من `getUser()` لتجنب network round-trip إضافي.

---

## الذكاء الاصطناعي — Ideas Space

**Endpoint:** `POST /api/ideas/suggest`

```
المدخلات : { title: string, body?: string, locale: "ar" | "en" }
المخرجات : { suggestion: string }

Provider  : NVIDIA NIM
Model     : meta/llama-3.1-8b-instruct
Timeout   : 50s AbortController + maxDuration=60s على Vercel
```

الـ `locale` يتحكم بلغة الرد — system prompt + user message كلاهما يؤكدان اللغة لضمان أن Llama لا يعكس لغة المدخلات.

---

## Internationalization

```typescript
// اللغة تُحفظ في localStorage + React Context
const { t, locale, toggleLocale } = useI18n();
// locale: "ar" | "en"

// RTL/LTR يُطبَّق تلقائياً على <html dir="...">
// جميع النصوص في src/lib/i18n/dictionaries.ts
```

---

## المصادقة

- Email/Password + Google OAuth عبر Supabase Auth
- `getServerUser()` مع `React.cache()` — استدعاء واحد لكل request مشترك بين layout و page
- Middleware (`src/lib/supabase/middleware.ts`) يجدد session token تلقائياً
- RLS على كل جداول Supabase تحمي البيانات بـ `auth.uid()`

---

## متغيرات البيئة

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

DEEPSEEK_API_KEY=nvapi-...          # NVIDIA NIM key (prefix: nvapi-)
AI_PROVIDER=nvidia                  # اختياري
AI_BASE_URL=                        # اختياري، default: https://integrate.api.nvidia.com/v1
AI_MODEL=                           # اختياري، default: meta/llama-3.1-8b-instruct
```

---

## الأوامر

```bash
# تشغيل محلي
npm run dev

# build إنتاجي
npm run build

# lint
npm run lint

# نشر للإنتاج
git add [files] && git commit -m "..." && git push origin main
npx vercel --prod --yes
```

---

## قرارات معمارية مهمة

| القرار | السبب |
|--------|-------|
| SWR بدلاً من Server Components | التنقل بين الصفحات فوري بعد أول تحميل |
| Client mutations بدلاً من Server Actions | تجاوز Vercel hop: browser→Supabase مباشرة (~50-150ms بدلاً من ~500ms+) |
| `getSession()` في Server Actions | قراءة محلية من cookie بدون network call لـ Supabase Auth |
| `React.cache()` على `getServerUser` | استدعاء auth مرة واحدة لكل request مشترك بين layout و page |
| React Portal للـ modals | `position: fixed` يتكسر مع `backdrop-filter` على parent elements |
| Optimistic UI على Toggle | الاستجابة الفورية للمستخدم مع revert تلقائي عند الخطأ |
