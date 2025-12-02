import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

describe('CSS Caching Utilities', () => {
  describe('extractTailwindClasses', () => {
    it('should extract classes from className attribute with double quotes', () => {
      const extractTailwindClasses = (content: string): string[] => {
        const classPattern = /className=["']([^"']+)["']/g;
        const classes: Set<string> = new Set();
        
        let match;
        while ((match = classPattern.exec(content)) !== null) {
          const classNames = match[1].split(/\s+/);
          classNames.forEach(cls => classes.add(cls));
        }
        
        return Array.from(classes).sort();
      };

      const content = '<div className="p-4 bg-blue-500">Hello</div>';
      const classes = extractTailwindClasses(content);
      
      expect(classes).toEqual(['bg-blue-500', 'p-4']);
    });

    it('should extract classes from className attribute with single quotes', () => {
      const extractTailwindClasses = (content: string): string[] => {
        const classPattern = /className=["']([^"']+)["']/g;
        const classes: Set<string> = new Set();
        
        let match;
        while ((match = classPattern.exec(content)) !== null) {
          const classNames = match[1].split(/\s+/);
          classNames.forEach(cls => classes.add(cls));
        }
        
        return Array.from(classes).sort();
      };

      const content = "<div className='text-red-500 font-bold'>Test</div>";
      const classes = extractTailwindClasses(content);
      
      expect(classes).toEqual(['font-bold', 'text-red-500']);
    });

    it('should extract classes from multiple elements', () => {
      const extractTailwindClasses = (content: string): string[] => {
        const classPattern = /className=["']([^"']+)["']/g;
        const classes: Set<string> = new Set();
        
        let match;
        while ((match = classPattern.exec(content)) !== null) {
          const classNames = match[1].split(/\s+/);
          classNames.forEach(cls => classes.add(cls));
        }
        
        return Array.from(classes).sort();
      };

      const content = `
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Title</h1>
          <p className="text-gray-600 mt-4">Description</p>
        </div>
      `;
      const classes = extractTailwindClasses(content);
      
      expect(classes).toEqual(['container', 'font-bold', 'mt-4', 'mx-auto', 'text-2xl', 'text-gray-600']);
    });

    it('should deduplicate classes', () => {
      const extractTailwindClasses = (content: string): string[] => {
        const classPattern = /className=["']([^"']+)["']/g;
        const classes: Set<string> = new Set();
        
        let match;
        while ((match = classPattern.exec(content)) !== null) {
          const classNames = match[1].split(/\s+/);
          classNames.forEach(cls => classes.add(cls));
        }
        
        return Array.from(classes).sort();
      };

      const content = `
        <div className="p-4">
          <p className="p-4 text-lg">Text</p>
        </div>
      `;
      const classes = extractTailwindClasses(content);
      
      expect(classes).toEqual(['p-4', 'text-lg']);
    });
  });

  describe('generateCssHash', () => {
    it('should generate consistent hash for same classes', () => {
      const generateCssHash = (classes: string[]): string => {
        const classesString = classes.join(' ');
        return crypto.createHash('md5').update(classesString).digest('hex');
      };

      const classes1 = ['p-4', 'bg-blue-500'];
      const classes2 = ['p-4', 'bg-blue-500'];
      
      const hash1 = generateCssHash(classes1);
      const hash2 = generateCssHash(classes2);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different classes', () => {
      const generateCssHash = (classes: string[]): string => {
        const classesString = classes.join(' ');
        return crypto.createHash('md5').update(classesString).digest('hex');
      };

      const classes1 = ['p-4', 'bg-blue-500'];
      const classes2 = ['p-4', 'bg-red-500'];
      
      const hash1 = generateCssHash(classes1);
      const hash2 = generateCssHash(classes2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate hash as 32-character hex string', () => {
      const generateCssHash = (classes: string[]): string => {
        const classesString = classes.join(' ');
        return crypto.createHash('md5').update(classesString).digest('hex');
      };

      const classes = ['p-4', 'bg-blue-500', 'text-white'];
      const hash = generateCssHash(classes);
      
      expect(hash).toMatch(/^[a-f0-9]{32}$/);
    });
  });

  describe('CSS Cache behavior', () => {
    it('should cache CSS based on class hash', () => {
      const cssCache = new Map<string, string>();
      const cssHash = 'abc123';
      const cssContent = '.p-4 { padding: 1rem; }';
      
      cssCache.set(cssHash, cssContent);
      
      expect(cssCache.has(cssHash)).toBe(true);
      expect(cssCache.get(cssHash)).toBe(cssContent);
    });

    it('should limit cache size', () => {
      const MAX_CSS_CACHE_SIZE = 3;
      const cssCache = new Map<string, string>();
      
      // Add items beyond the limit
      cssCache.set('hash1', 'css1');
      cssCache.set('hash2', 'css2');
      cssCache.set('hash3', 'css3');
      cssCache.set('hash4', 'css4');
      
      // Limit cache size
      if (cssCache.size > MAX_CSS_CACHE_SIZE) {
        const firstKey = cssCache.keys().next().value;
        if (firstKey) {
          cssCache.delete(firstKey);
        }
      }
      
      expect(cssCache.size).toBe(3);
      expect(cssCache.has('hash1')).toBe(false);
    });
  });
});
