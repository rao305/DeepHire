import { PDFParse } from 'pdf-parse';

export interface ResumeParseResult {
  rawText: string;
  cleanedText: string;
  sections: {
    contact?: string;
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
    projects?: string;
    certifications?: string;
    other?: string;
  };
  metadata: {
    pageCount: number;
    hasGitHubUrl: boolean;
    hasLinkedInUrl: boolean;
    hasPortfolioUrl: boolean;
    extractedUrls: string[];
  };
}

/**
 * Main function to parse resume PDF and extract structured data
 */
export async function parseResumePDF(buffer: Buffer): Promise<ResumeParseResult> {
  const parser = new PDFParse({ data: buffer });

  try {
    // Parse PDF
    const data = await parser.getText();

    if (!data || !data.text) {
      throw new Error('Empty PDF - no text content found');
    }

    const rawText = data.text;

    // Clean the text
    const cleanedText = cleanResumeText(rawText);

    if (!cleanedText.trim()) {
      throw new Error('Empty PDF after cleaning - no readable content');
    }

    // Detect sections
    const detectedSections = detectResumeSections(cleanedText);

    // Extract URLs
    const extractedUrls = extractUrlsFromText(cleanedText);

    // Detect URL types
    const hasGitHubUrl = extractedUrls.some(url =>
      url.toLowerCase().includes('github.com')
    );
    const hasLinkedInUrl = extractedUrls.some(url =>
      url.toLowerCase().includes('linkedin.com')
    );
    const hasPortfolioUrl = extractedUrls.some(url => {
      const lower = url.toLowerCase();
      return !lower.includes('github.com') &&
             !lower.includes('linkedin.com') &&
             (lower.includes('portfolio') ||
              lower.match(/\.(dev|io|com|net|org)/) !== null);
    });

    return {
      rawText,
      cleanedText,
      sections: {
        contact: detectedSections.contact,
        summary: detectedSections.summary,
        experience: detectedSections.experience,
        education: detectedSections.education,
        skills: detectedSections.skills,
        projects: detectedSections.projects,
        certifications: detectedSections.certifications,
        other: detectedSections.other,
      },
      metadata: {
        pageCount: data.total || 1,
        hasGitHubUrl,
        hasLinkedInUrl,
        hasPortfolioUrl,
        extractedUrls,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific PDF errors
      if (error.message.includes('encrypted') || error.message.includes('password')) {
        throw new Error('Password-protected PDF - cannot parse encrypted documents');
      }
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Corrupted PDF - file appears to be damaged or invalid');
      }
      if (error.message.includes('Empty PDF')) {
        throw error; // Re-throw our custom empty PDF error
      }
      // Generic error
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
    throw new Error('Failed to parse PDF: Unknown error');
  } finally {
    await parser.destroy();
  }
}

/**
 * Extract all URLs from text
 */
export function extractUrlsFromText(text: string): string[] {
  // Match http/https URLs
  const httpRegex = /(https?:\/\/[^\s,\)]+)/gi;
  const httpMatches = text.match(httpRegex) || [];

  // Match URLs without protocol (like github.com/username)
  const plainRegex = /(?:^|\s)((?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s,\)]*)?)/gi;
  const plainMatches = text.match(plainRegex) || [];

  // Combine and clean URLs
  const allUrls = [
    ...httpMatches,
    ...plainMatches.map(url => url.trim()).filter(url => !url.startsWith('http'))
  ];

  // Remove duplicates and clean trailing punctuation
  return Array.from(new Set(allUrls.map(url =>
    url.replace(/[,.\)]+$/, '').trim()
  )));
}

/**
 * Extract GitHub username from URLs
 */
export function identifyGitHubUsername(urls: string[]): string | null {
  for (const url of urls) {
    const lower = url.toLowerCase();
    if (!lower.includes('github.com')) continue;

    // Match patterns like:
    // - github.com/username
    // - github.com/username/repo
    // - https://github.com/username
    const match = url.match(/github\.com\/([a-zA-Z0-9-]+)/i);
    if (match && match[1]) {
      const username = match[1];
      // Exclude common GitHub paths that aren't usernames
      const excludedPaths = ['features', 'pricing', 'explore', 'topics', 'collections', 'trending', 'events'];
      if (!excludedPaths.includes(username.toLowerCase())) {
        return username;
      }
    }
  }
  return null;
}

/**
 * Clean resume text - remove excessive whitespace, normalize bullets, fix encoding
 */
export function cleanResumeText(text: string): string {
  let cleaned = text;

  // Fix common encoding issues
  cleaned = cleaned
    .replace(/\u0000/g, '') // Remove null characters
    .replace(/\uFFFD/g, '') // Remove replacement characters
    .replace(/[^\x20-\x7E\n\r\t]/g, match => {
      // Keep common unicode characters but remove problematic ones
      const code = match.charCodeAt(0);
      if (code >= 0x00A0 && code <= 0x00FF) return match; // Latin-1 supplement
      if (code >= 0x2018 && code <= 0x201F) return "'"; // Smart quotes
      if (code === 0x2022 || code === 0x2023 || code === 0x2043) return '•'; // Bullets
      if (code === 0x2013 || code === 0x2014) return '-'; // Dashes
      return '';
    });

  // Normalize bullets
  cleaned = cleaned
    .replace(/[▪▫●○■□◆◇⬥⬦]/g, '•')
    .replace(/^[\s]*[•\-\*]\s+/gm, '• ');

  // Remove excessive whitespace
  cleaned = cleaned
    .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines to max 2
    .replace(/^\s+|\s+$/gm, ''); // Trim each line

  // Remove page numbers (common patterns)
  cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');

  return cleaned.trim();
}

/**
 * Detect and extract resume sections
 */
export function detectResumeSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Section header patterns (case-insensitive, flexible matching)
  const sectionPatterns = {
    contact: /^(?:contact(?:\s+(?:info|information|details))?|personal(?:\s+(?:info|information|details))?)\s*$/i,
    summary: /^(?:summary|objective|profile|about(?:\s+me)?|professional\s+summary)\s*$/i,
    experience: /^(?:experience|work\s+experience|employment|professional\s+experience|work\s+history)\s*$/i,
    education: /^(?:education|academic\s+background|qualifications)\s*$/i,
    skills: /^(?:skills|technical\s+skills|competencies|expertise|technologies)\s*$/i,
    projects: /^(?:projects|personal\s+projects|portfolio|work\s+samples)\s*$/i,
    certifications: /^(?:certifications?|certificates?|licenses?|credentials?)\s*$/i,
  };

  const lines = text.split('\n');
  let currentSection = 'other'; // Default section for content before first header
  let currentContent: string[] = [];
  let firstContentIndex = 0;

  // First pass: detect if there's contact info at the top (before first section)
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this line looks like a section header
    const isHeader = Object.values(sectionPatterns).some(pattern => pattern.test(line));
    if (isHeader) {
      firstContentIndex = i;
      break;
    }
  }

  // If there's content before first section, treat it as contact info
  if (firstContentIndex > 0) {
    const contactLines = lines.slice(0, firstContentIndex).filter(l => l.trim());
    if (contactLines.length > 0) {
      sections.contact = contactLines.join('\n').trim();
    }
  }

  // Second pass: extract all sections
  for (let i = firstContentIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      currentContent.push(line);
      continue;
    }

    // Check if this line is a section header
    let foundSection: string | null = null;
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine)) {
        foundSection = sectionName;
        break;
      }
    }

    if (foundSection) {
      // Save previous section
      if (currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (content) {
          if (sections[currentSection]) {
            sections[currentSection] += '\n\n' + content;
          } else {
            sections[currentSection] = content;
          }
        }
      }

      // Start new section
      currentSection = foundSection;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save final section
  if (currentContent.length > 0) {
    const content = currentContent.join('\n').trim();
    if (content) {
      if (sections[currentSection]) {
        sections[currentSection] += '\n\n' + content;
      } else {
        sections[currentSection] = content;
      }
    }
  }

  return sections;
}

// Legacy exports for backward compatibility
export async function parsePDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const data = await parser.getText();
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  } finally {
    await parser.destroy();
  }
}

export function extractSections(text: string) {
  return detectResumeSections(text);
}

export function extractUrls(text: string): string[] {
  return extractUrlsFromText(text);
}

export function extractEmails(text: string): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const matches = text.match(emailRegex);
  return matches || [];
}

export function extractGithubUrls(text: string): string[] {
  const urls = extractUrlsFromText(text);
  return urls.filter(url => url.toLowerCase().includes('github.com'));
}

export function extractLinkedinUrls(text: string): string[] {
  const urls = extractUrlsFromText(text);
  return urls.filter(url => url.toLowerCase().includes('linkedin.com'));
}
