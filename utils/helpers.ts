import { Business } from '../types';

/**
 * Parses a Markdown table string into an array of Business objects.
 * Assumes the Gemini model follows the requested format:
 * | Name | Phone | Email | Address | Website | Rating | Google Maps URL |
 */
export const parseMarkdownTable = (markdown: string): Business[] => {
  const lines = markdown.split('\n');
  const businesses: Business[] = [];
  
  // Find the header line index to start parsing after it
  let headerFound = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines or non-table lines
    if (!trimmed.startsWith('|')) continue;
    
    // Skip the separator line (e.g., |---|---|)
    if (trimmed.includes('---')) {
        headerFound = true;
        continue;
    }

    // If we haven't passed the header yet, check if this is the header
    if (!headerFound) {
        if (trimmed.toLowerCase().includes('name') && trimmed.toLowerCase().includes('phone')) {
            // This is likely the header
            headerFound = true;
            continue; 
        }
    }

    // Parse row
    // Remove leading/trailing pipes and split
    const columns = trimmed.split('|').map(col => col.trim()).filter((col, index, arr) => {
        // Filter out the empty strings resulting from the split at the start/end pipes
        return true;
    });

    // Re-clean columns based on pipe logic
    // A line like "| Name | Phone |" splits to ["", "Name", "Phone", ""]
    const cleanColumns = columns.filter((c, i) => {
        // keep it if it's not the empty start/end artifacts
        // heuristic: typically the split creates empty strings at ends
        return !(c === '' && (i === 0 || i === columns.length - 1));
    });

    // We expect 7 columns: Name, Phone, Email, Address, Website, Rating, Google Maps URL
    if (cleanColumns.length >= 5) { 
       const name = cleanColumns[0] || 'N/A';
       const phone = cleanColumns[1] || 'N/A';
       const email = cleanColumns[2] || 'N/A';
       const address = cleanColumns[3] || 'N/A';
       const website = cleanColumns[4] || 'N/A';
       const rating = cleanColumns[5] || 'N/A';
       const googleMapsUrl = cleanColumns[6] || 'N/A';

       businesses.push({
         id: crypto.randomUUID(),
         name: cleanCell(name),
         phone: cleanCell(phone),
         email: cleanCell(email),
         address: cleanCell(address),
         website: cleanUrl(website),
         rating: cleanCell(rating),
         googleMapsUrl: cleanUrl(googleMapsUrl)
       });
    }
  }
  return businesses;
};

const cleanCell = (text: string): string => {
    if (!text) return '';
    if (text === 'N/A' || text === '-' || text === 'n/a') return '';
    return text;
};

const cleanUrl = (text: string): string => {
    const cleaned = cleanCell(text);
    if (!cleaned) return '';

    // Handle markdown links: [Title](https://example.com) -> https://example.com
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    const match = cleaned.match(markdownLinkRegex);
    if (match && match[2]) {
        return match[2];
    }
    
    // Handle angle brackets: <https://example.com>
    const angleBracketRegex = /<([^>]+)>/;
    const angleMatch = cleaned.match(angleBracketRegex);
    if (angleMatch && angleMatch[1]) {
        return angleMatch[1];
    }

    // Fallback: if it looks like a url, return it.
    if (cleaned.startsWith('http') || cleaned.startsWith('www')) {
        return cleaned;
    }

    return cleaned;
};

export const deduplicateBusinesses = (existing: Business[], newItems: Business[]): Business[] => {
    const unique = [...existing];
    const existingSignatures = new Set(existing.map(b => `${b.name.toLowerCase()}|${b.address.toLowerCase()}`));

    for (const item of newItems) {
        const signature = `${item.name.toLowerCase()}|${item.address.toLowerCase()}`;
        if (!existingSignatures.has(signature)) {
            unique.push(item);
            existingSignatures.add(signature);
        }
    }
    return unique;
};

export const downloadCSV = (data: Business[], filename: string = 'leads.csv') => {
  if (!data.length) return;

  const headers = ['Name', 'Phone', 'Email', 'Address', 'Website', 'Rating', 'Google Maps URL'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => {
      return [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.phone.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        `"${row.address.replace(/"/g, '""')}"`,
        `"${row.website.replace(/"/g, '""')}"`,
        `"${row.rating.replace(/"/g, '""')}"`,
        `"${row.googleMapsUrl ? row.googleMapsUrl.replace(/"/g, '""') : ''}"`
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};