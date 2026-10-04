# HANU Hungry QA test matrix

Generated from the captured test results. See [QA report](QA_REPORT.md) for suite totals and known external limits.

| ID | Expected behavior | Result | Method | Evidence |
| --- | --- | --- | --- | --- |
| UNIT-001 | CSV parser handles quoted comma, quote and newline | PASS | Node test runner | Test runner reported pass. |
| UNIT-002 | price parser keeps source text and parses only clear bounds | PASS | Node test runner | Test runner reported pass. |
| UNIT-003 | category and dish identities are stable | PASS | Node test runner | Test runner reported pass. |
| UNIT-004 | source data can be imported without losing restaurant/dish grain | PASS | Node test runner | Test runner reported pass. |
| UNIT-005 | MSSV is exactly ten ASCII digits | PASS | Node test runner | Test runner reported pass. |
| UNIT-006 | display name is the email local part | PASS | Node test runner | Test runner reported pass. |
| UNIT-007 | password and internal redirect validation | PASS | Node test runner | Test runner reported pass. |
| UNIT-008 | auth callback origin uses each Vercel Preview URL and an explicit production URL | PASS | Node test runner | Test runner reported pass. |
| UNIT-009 | bootstrap creates once and preserves the existing password | PASS | Node test runner | Test runner reported pass. |
| UNIT-010 | bootstrap refuses a conflicting MSSV instead of changing an account | PASS | Node test runner | Test runner reported pass. |
| UNIT-011 | missing restaurant data stays explicit and never becomes a fake zero price | PASS | Node test runner | Test runner reported pass. |
| UNIT-012 | Maps uses real coordinates first, or encoded source location text | PASS | Node test runner | Test runner reported pass. |
| UNIT-013 | check-in streak and weekly recap use Vietnam calendar days | PASS | Node test runner | Test runner reported pass. |
| UNIT-014 | gacha never invents a choice when the database query is empty | PASS | Node test runner | Test runner reported pass. |
| UNIT-015 | U01 email validation rejects malformed, whitespace and overlong addresses | PASS | Node test runner | Test runner reported pass. |
| UNIT-016 | U02 password bounds are exactly 8 to 72 characters | PASS | Node test runner | Test runner reported pass. |
| UNIT-017 | U03 return paths preserve internal query and fragment | PASS | Node test runner | Test runner reported pass. |
| UNIT-018 | U04 return paths reject control characters and external destinations | PASS | Node test runner | Test runner reported pass. |
| UNIT-019 | U05 restaurant name is trimmed and capped at 180 characters | PASS | Node test runner | Test runner reported pass. |
| UNIT-020 | U06 restaurant coordinates require a valid pair | PASS | Node test runner | Test runner reported pass. |
| UNIT-021 | U07 category links deduplicate and reject invalid identifiers | PASS | Node test runner | Test runner reported pass. |
| UNIT-022 | U08 restaurant photo URLs accept HTTP(S), reject executable schemes | PASS | Node test runner | Test runner reported pass. |
| UNIT-023 | U09 category slugs normalize case and reject malformed names | PASS | Node test runner | Test runner reported pass. |
| UNIT-024 | U10 dish requires a valid parent restaurant and a name | PASS | Node test runner | Test runner reported pass. |
| UNIT-025 | U11 missing dish prices stay null, clear zero and equal bounds remain valid | PASS | Node test runner | Test runner reported pass. |
| UNIT-026 | U12 dish price rejects negative, fractional, non-finite and inverted ranges | PASS | Node test runner | Test runner reported pass. |
| UNIT-027 | U13 original per-unit price is retained | PASS | Node test runner | Test runner reported pass. |
| UNIT-028 | U14 Blog requires slug, title, content and explicit supported status | PASS | Node test runner | Test runner reported pass. |
| UNIT-029 | U15 Blog cover rejects executable schemes and overlong excerpt | PASS | Node test runner | Test runner reported pass. |
| UNIT-030 | U16 budget accepts one dong through ten million with exact integer bounds | PASS | Node test runner | Test runner reported pass. |
| UNIT-031 | U17 accent normalization covers uppercase D-stroke and whitespace | PASS | Node test runner | Test runner reported pass. |
| UNIT-032 | U18 price and category filters work independently | PASS | Node test runner | Test runner reported pass. |
| UNIT-033 | U19 matching restaurant names still obey budget and exclude unknown prices | PASS | Node test runner | Test runner reported pass. |
| UNIT-034 | U20 literal wildcard characters do not match all catalog entries | PASS | Node test runner | Test runner reported pass. |
| UNIT-035 | U21 suggestion ranking prefers prefix matches and caps at six | PASS | Node test runner | Test runner reported pass. |
| UNIT-036 | U22 suggestions omit prices above budget and preserve source input | PASS | Node test runner | Test runner reported pass. |
| UNIT-037 | U23 missing display values never render literal sentinels | PASS | Node test runner | Test runner reported pass. |
| UNIT-038 | U24 missing Maps sentinels do not create invented locations | PASS | Node test runner | Test runner reported pass. |
| UNIT-039 | U25 Maps safely encodes special location text and accepts real zero coordinates | PASS | Node test runner | Test runner reported pass. |
| UNIT-040 | U26 empty history has all zero statistics | PASS | Node test runner | Test runner reported pass. |
| UNIT-041 | U27 duplicate visits on one day count once toward streak | PASS | Node test runner | Test runner reported pass. |
| UNIT-042 | U28 weekly recap starts Monday in Vietnam, excludes next week | PASS | Node test runner | Test runner reported pass. |
| UNIT-043 | U29 a gap breaks current streak while retaining longest streak | PASS | Node test runner | Test runner reported pass. |
| UNIT-044 | U30 Gacha returns only actual candidates without mutating the list | PASS | Node test runner | Test runner reported pass. |
| UNIT-045 | price accepts 70000 exactly, grouped digits and integer dong | PASS | Node test runner | Test runner reported pass. |
| UNIT-046 | one-character and accent-free queries find actual matching dishes | PASS | Node test runner | Test runner reported pass. |
| UNIT-047 | category, price and dish query must match together; unknown prices are excluded | PASS | Node test runner | Test runner reported pass. |
| DB01 | Exactly two configured ADMIN profiles exist | PASS | Supabase Data API | All assertions passed |
| DB02 | Second configured ADMIN can authenticate | PASS | Supabase Data API | All assertions passed |
| DB03 | Signup trigger ignores user supplied ADMIN role and uses email local part | PASS | Supabase Data API | All assertions passed |
| DB04 | Invalid MSSV is rejected by the database signup trigger | PASS | Supabase Data API | All assertions passed |
| DB05 | Duplicate MSSV is rejected during account creation | PASS | Supabase Data API | All assertions passed |
| DB-ANON-profiles | Anonymous cannot read profiles | PASS | Supabase Data API | All assertions passed |
| DB-ANON-check_ins | Anonymous cannot read check_ins | PASS | Supabase Data API | All assertions passed |
| DB-ANON-notifications | Anonymous cannot read notifications | PASS | Supabase Data API | All assertions passed |
| DB-ANON-notification_reads | Anonymous cannot read notification_reads | PASS | Supabase Data API | All assertions passed |
| DB-ANON-contact_messages | Anonymous cannot read contact_messages | PASS | Supabase Data API | All assertions passed |
| DB-ANON-admin_audit_logs | Anonymous cannot read admin_audit_logs | PASS | Supabase Data API | All assertions passed |
| DB06 | USER sees only own private profile | PASS | Supabase Data API | All assertions passed |
| DB07 | USER can update own display name | PASS | Supabase Data API | All assertions passed |
| DB-IDENTITY-role | USER cannot update identity field role | PASS | Supabase Data API | All assertions passed |
| DB-IDENTITY-student_code | USER cannot update identity field student_code | PASS | Supabase Data API | All assertions passed |
| DB-IDENTITY-id | USER cannot update identity field id | PASS | Supabase Data API | All assertions passed |
| DB08 | USER cannot update another profile | PASS | Supabase Data API | All assertions passed |
| DB09 | ADMIN cannot read or update another private profile | PASS | Supabase Data API | All assertions passed |
| DB10 | USER and ADMIN JWTs cannot use Supabase Auth Admin management | PASS | Supabase Data API | All assertions passed |
| DB11 | ADMIN can create and link restaurant, category and dishes | PASS | Supabase Data API | All assertions passed |
| DB-WRITE-restaurants | USER cannot create restaurants | PASS | Supabase Data API | All assertions passed |
| DB-WRITE-categories | USER cannot create categories | PASS | Supabase Data API | All assertions passed |
| DB-WRITE-dishes | USER cannot create dishes | PASS | Supabase Data API | All assertions passed |
| DB-WRITE-blog_posts | USER cannot create blog_posts | PASS | Supabase Data API | All assertions passed |
| DB-WRITE-site_settings | USER cannot create site_settings | PASS | Supabase Data API | All assertions passed |
| DB12 | USER cannot update or delete restaurant content | PASS | Supabase Data API | All assertions passed |
| DB13 | Anonymous sees active restaurant, hides inactive restaurant and dishes | PASS | Supabase Data API | All assertions passed |
| DB14 | ADMIN can update content and deactivate/reactivate a restaurant | PASS | Supabase Data API | All assertions passed |
| DB15 | Database enforces valid coordinates and paired values | PASS | Supabase Data API | All assertions passed |
| DB16 | Database enforces dish price range and restaurant foreign key | PASS | Supabase Data API | All assertions passed |
| DB17 | Search RPC is accent insensitive and honors exact price 70000 | PASS | Supabase Data API | All assertions passed |
| DB18 | ADMIN content writes create audit records without credential metadata | PASS | Supabase Data API | All assertions passed |
| DB19 | USER cannot read audit log or run analytics | PASS | Supabase Data API | All assertions passed |
| DB20 | USER can create own check-in with a valid active dish | PASS | Supabase Data API | All assertions passed |
| DB21 | Check-in rejects mismatched and inactive dishes | PASS | Supabase Data API | All assertions passed |
| DB22 | Check-in rejects inactive restaurants and spoofed user IDs | PASS | Supabase Data API | All assertions passed |
| DB23 | USER can read and update own check-in | PASS | Supabase Data API | All assertions passed |
| DB24 | Another USER and ADMIN cannot read, update or delete private check-in | PASS | Supabase Data API | All assertions passed |
| DB25 | Existing visit remains readable after its dish is deactivated | PASS | Supabase Data API | All assertions passed |
| DB26 | USER can create review; rating constraints and uniqueness are enforced | PASS | Supabase Data API | All assertions passed |
| DB27 | Reviews are public but another USER or ADMIN cannot edit or delete them | PASS | Supabase Data API | All assertions passed |
| DB28 | USER can update own review and data stays text | PASS | Supabase Data API | All assertions passed |
| DB29 | ADMIN analytics equals source count deltas and exposes aggregates only | PASS | Supabase Data API | All assertions passed |
| DB30 | USER can delete own review and check-in | PASS | Supabase Data API | All assertions passed |
| DB31 | ADMIN draft Blog is hidden from anonymous and regular USER | PASS | Supabase Data API | All assertions passed |
| DB32 | Publishing Blog creates exactly one global notification and timestamp | PASS | Supabase Data API | All assertions passed |
| DB33 | All USER accounts can read the new global notification | PASS | Supabase Data API | All assertions passed |
| DB34 | Editing and republishing Blog updates link without duplicate notifications | PASS | Supabase Data API | All assertions passed |
| DB35 | Mark-read is idempotent and each USER has independent read state | PASS | Supabase Data API | All assertions passed |
| DB36 | USER cannot mark another USER notification state or create global notifications | PASS | Supabase Data API | All assertions passed |
| DB37 | USER can send contact only with own user ID and cannot read private inbox | PASS | Supabase Data API | All assertions passed |
| DB38 | ADMIN can delete a Blog and anonymous cannot read the deleted post | PASS | Supabase Data API | All assertions passed |
| DB-CLEANUP | All temporary QA accounts and owned content are removed | PASS | Supabase Data API | All assertions passed |
| HTTP-PUBLIC-home | Anonymous GET / succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-restaurants | Anonymous GET /restaurants succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-gacha | Anonymous GET /gacha succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-blog | Anonymous GET /blog succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-about | Anonymous GET /about succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-contact | Anonymous GET /contact succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-login | Anonymous GET /login succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-register | Anonymous GET /register succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PUBLIC-forgot-password | Anonymous GET /forgot-password succeeds | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PRIVATE-profile | Anonymous GET /profile redirects to login with return path | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PRIVATE-history | Anonymous GET /history redirects to login with return path | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PRIVATE-notifications | Anonymous GET /notifications redirects to login with return path | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PRIVATE-settings-password | Anonymous GET /settings/password redirects to login with return path | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PRIVATE-admin | Anonymous GET /admin redirects to login with return path | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-PRIVATE-admin-analytics | Anonymous GET /admin/analytics redirects to login with return path | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP01 | Missing and malformed restaurant/blog URLs return 404 | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP02 | Invalid recovery callback redirects safely to expired link message | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP03 | Registration rejects invalid input on the server | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP04 | Registration rejects invalid input on the server | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP05 | Registration rejects invalid input on the server | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP06 | Registration rejects invalid input on the server | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP07 | Malformed MSSV login rejected before authentication | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP08 | Unknown MSSV and wrong password share generic error and create no auth cookies | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP09 | MSSV USER login without Remember writes session-only auth cookies | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP10 | Remember writes persistent auth cookies and external next is discarded | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP11 | Configured ADMIN logs in by MSSV and can view analytics | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP12 | Regular USER cannot open ADMIN pages | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP13 | Display-name action trims text and leaves MSSV unchanged | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP14 | Viewing restaurant does not create check-in | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP15 | Explicit check-in stores chosen active dish and appears in history | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP16 | Forged check-in dish and inactive restaurant create no additional rows | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP17 | Forged delete cannot remove another USER check-in | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP18 | Check-in without dish stores SQL NULL | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP19 | Invalid review rating/comment is rejected by direct POST | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP20 | Create review persists rating and escapes script text in public HTML | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP21 | Review update and delete enforce ownership even with captured action payload | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP22 | Contact honeypot creates no message | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP23 | Contact rejects invalid email and stores valid message for current USER | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-ADMIN-GUARD-restaurant | ADMIN restaurant action rejects USER and anonymous POST to public route | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-ADMIN-GUARD-category | ADMIN category action rejects USER and anonymous POST to public route | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-ADMIN-GUARD-dish | ADMIN dish action rejects USER and anonymous POST to public route | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP-ADMIN-GUARD-blog | ADMIN blog action rejects USER and anonymous POST to public route | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP24 | Cross-origin ADMIN POST is rejected before content write | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP25 | ADMIN invalid restaurant inputs return validation message | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP26 | ADMIN creates restaurant and links selected category through form | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP27 | ADMIN edits restaurant and removes classification | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP28 | ADMIN deactivates/reactivates restaurant through form | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP29 | ADMIN creates category, edits it and deletes it through form | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP30 | ADMIN creates dish at exactly 70000 then edits and toggles visibility | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP31 | ADMIN creates draft Blog, publishes it and notification is created once | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP32 | Mark-one and mark-all notification forms are idempotent and private | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP33 | Unpublished Blog removes notification link and deletion works | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP34 | Forgot-password rejects malformed email/MSSV and mismatches return generic success | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP35 | Password change rejects wrong current password, mismatch and unchanged value | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP36 | Password change succeeds and new MSSV credentials authenticate | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP37 | Reset form without verified recovery session rejects new password | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP38 | Verified recovery token allows password reset once and clears session | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| HTTP39 | Logout clears USER session and protected pages redirect again | PASS | HTTP: real Next.js pages and Server Actions | All assertions passed |
| MAIL01 | Signup confirmation email reaches inbox | BLOCKED | External configuration | Custom SMTP is not configured; no delivered email can be asserted. |
| MAIL02 | Matching email + MSSV sends a usable reset email to inbox | BLOCKED | External configuration | Recovery callback/reset was tested with a server-generated QA token; actual SMTP delivery remains unverified. |
| UI-LAYOUT-320-home | No horizontal overflow on / at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-restaurants | No horizontal overflow on /restaurants at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-gacha | No horizontal overflow on /gacha at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-login | No horizontal overflow on /login at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-register | No horizontal overflow on /register at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-forgot-password | No horizontal overflow on /forgot-password at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-about | No horizontal overflow on /about at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-contact | No horizontal overflow on /contact at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-320-blog | No horizontal overflow on /blog at 320px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-home | No horizontal overflow on / at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-restaurants | No horizontal overflow on /restaurants at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-gacha | No horizontal overflow on /gacha at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-login | No horizontal overflow on /login at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-register | No horizontal overflow on /register at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-forgot-password | No horizontal overflow on /forgot-password at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-about | No horizontal overflow on /about at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-contact | No horizontal overflow on /contact at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-360-blog | No horizontal overflow on /blog at 360px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-home | No horizontal overflow on / at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-restaurants | No horizontal overflow on /restaurants at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-gacha | No horizontal overflow on /gacha at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-login | No horizontal overflow on /login at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-register | No horizontal overflow on /register at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-forgot-password | No horizontal overflow on /forgot-password at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-about | No horizontal overflow on /about at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-contact | No horizontal overflow on /contact at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-390-blog | No horizontal overflow on /blog at 390px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-home | No horizontal overflow on / at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-restaurants | No horizontal overflow on /restaurants at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-gacha | No horizontal overflow on /gacha at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-login | No horizontal overflow on /login at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-register | No horizontal overflow on /register at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-forgot-password | No horizontal overflow on /forgot-password at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-about | No horizontal overflow on /about at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-contact | No horizontal overflow on /contact at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-430-blog | No horizontal overflow on /blog at 430px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-home | No horizontal overflow on / at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-restaurants | No horizontal overflow on /restaurants at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-gacha | No horizontal overflow on /gacha at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-login | No horizontal overflow on /login at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-register | No horizontal overflow on /register at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-forgot-password | No horizontal overflow on /forgot-password at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-about | No horizontal overflow on /about at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-contact | No horizontal overflow on /contact at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-768-blog | No horizontal overflow on /blog at 768px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-home | No horizontal overflow on / at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-restaurants | No horizontal overflow on /restaurants at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-gacha | No horizontal overflow on /gacha at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-login | No horizontal overflow on /login at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-register | No horizontal overflow on /register at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-forgot-password | No horizontal overflow on /forgot-password at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-about | No horizontal overflow on /about at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-contact | No horizontal overflow on /contact at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI-LAYOUT-1280-blog | No horizontal overflow on /blog at 1280px viewport width. | PASS | Codex Browser viewport + DOM measurements | documentElement.scrollWidth did not exceed clientWidth. |
| UI01 | A one-character b query immediately filters restaurants and shows matching dish suggestions. | PASS | Codex Browser interaction + rendered DOM | The live result count changed, and up to six matching dish suggestions appeared. |
| UI02 | Accent-free bun and accented bún queries return equal result counts. | PASS | Codex Browser interaction + rendered DOM | Both searches returned 16 restaurants and six suggestions. |
| UI03 | An exact maximum price of 70000 is accepted without being raised to 70001. | PASS | Codex Browser interaction + rendered DOM | The input retained 70000 and reported aria-invalid=false. |
| UI04 | Clear filters resets query, category, maximum price and result count. | PASS | Codex Browser interaction + rendered DOM | Search and budget were empty, category was all, and 60 restaurants were shown. |
| UI05 | Gacha restaurant mode spins before revealing a result from the catalog. | PASS | Codex Browser interaction + rendered DOM | At 900ms it was still busy with no reveal; after the animation it showed a restaurant and visit link. |
| UI06 | Gacha dish mode spins before revealing a dish and its restaurant. | PASS | Codex Browser interaction + rendered DOM | The result included a real dish, restaurant name and visit link. |
| UI07 | The Gacha action is disabled while a spin is in progress. | PASS | Codex Browser interaction + rendered DOM | During the spin aria-busy was true and the action button was disabled. |
| UI08 | The current navigation item has the active background on desktop and mobile. | PASS | Codex Browser interaction + rendered DOM | Home, Explore, Gacha and Blog each displayed the red active background. |
| UI09 | Body, title and Gacha caption use the requested local fonts. | PASS | Codex Browser interaction + rendered DOM | Computed families were Hermeneus One, Calistoga and Henny Penny. |
| UI10 | Restaurant pages do not show food images or food emoji placeholders. | PASS | Codex Browser interaction + rendered DOM | No food image elements or food emoji placeholders appeared in tested routes. |
| UI11 | Login identifies student code (MSSV), not email, as the username field. | PASS | Codex Browser interaction + rendered DOM | The labeled text input was MSSV; password and remember controls were present. |
| GATE-LINT | ESLint completes with no errors or warnings. | PASS | npm run lint | Exit code 0; no diagnostics. |
| GATE-BUILD | Next.js optimized production build completes with TypeScript checks. | PASS | npm run build | Production build and all 27 generated page checks completed. |
| GATE-DB-SEED | The Supabase seed retains the expected source totals after test cleanup. | PASS | npm run db:verify -- --expect-seed | 59 restaurants, 950 dishes, 17 categories and 30 links verified. |
| GATE-DB-QA | Database integration policy and application cases finish with no failures. | PASS | Supabase remote QA suite | 53/53 passed; test cleanup passed. |
| GATE-HTTP-QA | Real Next.js HTTP and Server Action tests finish with no failures. | PASS | Local production-mode Next.js server + temporary Supabase fixtures | 58/60 passed; 2 email-delivery cases await SMTP. |
| GATE-VERCEL-SECRETS | Preview and Production each hold the service key as a hidden server-side secret. | PASS | Vercel environment metadata | SUPABASE_SERVICE_ROLE_KEY is Hidden/Secret for Production and Preview branch codex/full-stack-implementation. No value was read back. |
