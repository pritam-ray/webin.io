/**
 * Deduplication utility for CRM leads.
 * Checks phone and email against existing leads to prevent duplicates.
 */

/**
 * Normalize a phone number by removing spaces, dashes, and country code prefixes.
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '').replace(/^0/, '');
}

/**
 * Normalize an email to lowercase and trim.
 */
export function normalizeEmail(email) {
  if (!email) return '';
  return email.toLowerCase().trim();
}

/**
 * Check if a new lead is a duplicate of any existing lead.
 * Matches on phone OR email.
 * Returns the matching existing lead if found, or null.
 */
export function findDuplicate(newLead, existingLeads) {
  const newPhone = normalizePhone(newLead.phone);
  const newEmail = normalizeEmail(newLead.email);

  for (const existing of existingLeads) {
    const existPhone = normalizePhone(existing.phone);
    const existEmail = normalizeEmail(existing.email);

    if (newPhone && existPhone && newPhone === existPhone) {
      return existing;
    }
    if (newEmail && existEmail && newEmail === existEmail) {
      return existing;
    }
  }

  return null;
}

/**
 * Deduplicate an array of new leads against existing leads.
 * Returns { clean: [], duplicates: [] }
 */
export function deduplicateLeads(newLeads, existingLeads) {
  const clean = [];
  const duplicates = [];
  const seenInBatch = new Map();

  for (const lead of newLeads) {
    const phone = normalizePhone(lead.phone);
    const email = normalizeEmail(lead.email);

    // Check within the new batch itself
    const batchKey = phone || email;
    if (batchKey && seenInBatch.has(batchKey)) {
      duplicates.push({ lead, matchedWith: seenInBatch.get(batchKey), source: 'batch' });
      continue;
    }

    // Check against existing leads in DB
    const existingMatch = findDuplicate(lead, existingLeads);
    if (existingMatch) {
      duplicates.push({ lead, matchedWith: existingMatch, source: 'database' });
      continue;
    }

    if (phone) seenInBatch.set(phone, lead);
    if (email) seenInBatch.set(email, lead);
    clean.push(lead);
  }

  return { clean, duplicates };
}

/**
 * Parse a CSV string into an array of lead objects.
 */
export function parseCsv(csvString) {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));

  const headerMap = {};
  headers.forEach((h, i) => {
    if (h.includes('name') && !h.includes('company')) headerMap.name = i;
    else if (h.includes('phone') || h.includes('mobile') || h.includes('contact')) headerMap.phone = i;
    else if (h.includes('email') || h.includes('mail')) headerMap.email = i;
    else if (h.includes('company') || h.includes('business') || h.includes('org')) headerMap.company = i;
    else if (h.includes('city') || h.includes('location') || h.includes('place')) headerMap.city = i;
    else if (h.includes('note') || h.includes('remark') || h.includes('comment')) headerMap.notes = i;
  });

  const leads = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.every(v => !v)) continue;

    leads.push({
      name: values[headerMap.name] || 'Unknown',
      phone: values[headerMap.phone] || '',
      email: values[headerMap.email] || '',
      company: values[headerMap.company] || '',
      city: values[headerMap.city] || '',
      notes: values[headerMap.notes] || '',
    });
  }

  return leads;
}
