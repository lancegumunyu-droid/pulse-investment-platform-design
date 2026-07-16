# AUTH0 TENANT SETTINGS - EXACT VALUES FOR PULSE

## TENANT INFORMATION (Read-Only)

```
Tenant Name: dev-7m32r3oudhuzlcvo
Region: UK-1
Environment: Production ✅ (already correct)
```

---

## API AUTHORIZATION SETTINGS

### Default Audience
**Field Name:** Default Audience

**Value to Enter:**
```
https://api.pulseinvestme.dpdns.org
```

**Why:** This is your API identifier for Auth0. It tells Auth0 where your API is located.

---

### Default Directory
**Field Name:** Default Directory

**Value to Enter:**
```
Username-Password-Authentication
```

**Why:** This is the connection type for email/password login. Auth0 creates this by default.

---

## ERROR PAGES

### Default Error Page
**Setting:** Generic (KEEP SELECTED ✅)

**Why:** Provides Auth0's built-in error page. Don't change to Custom unless you have a custom error page URL.

---

## LANGUAGES

### Default Language
**Setting:** English (en) (KEEP SELECTED ✅)

**Why:** PULSE is English-only for now.

### Supported Languages
**Setting:** UNCHECK ALL (leave unchecked ✅)

**Why:** Only English needed for PULSE launch.

---

## ADVANCED SETTINGS (If visible)

### Email Settings
- **From Email Address:** `noreply@pulseinvestme.dpdns.org`
- **Email Domain:** `pulseinvestme.dpdns.org`

### Tenant Logs
- **Keep enabled** to monitor authentication events

---

## COMPLETE SETUP SUMMARY

```
✅ Tenant Name: dev-7m32r3oudhuzlcvo
✅ Region: UK-1
✅ Environment: Production

✅ Default Audience: https://api.pulseinvestme.dpdns.org
✅ Default Directory: Username-Password-Authentication

✅ Default Error Page: Generic
✅ Default Language: English (en)
✅ Supported Languages: None (all unchecked)
```

---

## STEP-BY-STEP TO FILL IN

1. **Default Audience** field:
   - Click the field
   - Enter: `https://api.pulseinvestme.dpdns.org`

2. **Default Directory** field:
   - Click dropdown
   - Select: `Username-Password-Authentication`

3. **Default Error Page**:
   - Keep `Generic` selected (radio button)

4. **Default Language**:
   - Keep `English (en)` selected

5. **Supported Languages**:
   - UNCHECK all checkboxes

6. **Click SAVE** at the bottom

---

## IMPORTANT

- Do NOT change Production environment
- Do NOT enable Custom Error Page
- Do NOT add extra languages
- Keep everything as specified above

---

## WHAT HAPPENS AFTER SAVING

✅ Auth0 will use your API audience for all tokens
✅ Password login will work with Username-Password connection
✅ Email verification will send from noreply@pulseinvestme.dpdns.org
✅ Error pages will show Auth0 default (professional)
✅ Everything ready for production launch

---

Done? Click Save and let me know!
