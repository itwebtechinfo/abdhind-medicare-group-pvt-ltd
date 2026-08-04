<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Feature folder convention (`src/features/*`)

Each feature gets **one** non-component file — `<entity>.ts` — holding, in this order: types, zod schema(s), then the service (API calls). Example: `features/doctors/doctor.ts` has `RawApiDoctor`/`ApiDoctor` types, `createDoctorSchema`/`editDoctorSchema`, and `doctorService`. Do NOT split these back into separate `-types.ts` / `-schema.ts` / `-service.ts` files.

UI stays separate: one `.tsx` per dialog/section component (e.g. `DoctorFormDialog.tsx`, `LeaveCalendarDialog.tsx`), living alongside `doctor.ts` in the same feature folder.

If a feature needs a constant shared with another feature (avoiding a circular import between two merged feature files), put it in `src/lib/` (see `src/lib/otp.ts`) rather than re-introducing a split file.

A feature with no distinct entity work (e.g. `auth/login-schema.ts`) can keep its single existing file name — don't rename just for consistency.
