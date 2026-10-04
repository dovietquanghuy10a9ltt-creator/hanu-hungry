# HANU Hungry QA report

Executed: 2026-10-04T17:03:31.959Z

**229 passed · 0 failed · 2 blocked**

## Suites

- **unit:** 47/47 passed.
- **database:** 53/53 passed.
- **http:** 58/60 passed, 2 blocked.
- **browser:** 65/65 passed.
- **gates:** 6/6 passed.

## External configuration limits

- **MAIL01:** Signup confirmation email reaches inbox. Custom SMTP is not configured; no delivered email can be asserted.
- **MAIL02:** Matching email + MSSV sends a usable reset email to inbox. Recovery callback/reset was tested with a server-generated QA token; actual SMTP delivery remains unverified.

## Scope and cleanup

The live database QA run used uniquely named disposable accounts and temporary content, then verified those test records were removed. Existing seeded restaurant and dish records were left unchanged. The seed check afterward confirmed 59 restaurants, 950 dishes, 17 categories and 30 restaurant-category links.

Recovery callback and password reset were tested with server-generated links for temporary QA accounts. SMTP delivery remains unverified because no custom SMTP is configured.

The report covers the acceptance scenarios exercised in unit tests, Supabase policy checks, real Next.js HTTP actions, and responsive browser checks. It is not a claim that every possible input combination has been exhausted.
