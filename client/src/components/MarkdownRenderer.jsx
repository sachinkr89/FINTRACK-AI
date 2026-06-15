import React from 'react';

/**
 * A lightweight, dependency-free Markdown renderer tailored for personal finance advice output.
 * Renders headers, lists, code tokens, bold/italic text, and styled glassmorphism tables.
 */
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // Inline formatting helper (handles **bold**, *italic*, `code`)
  const renderInline = (text) => {
    if (typeof text !== 'string') return text;
    
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-text-primary">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-bg-tertiary/40 px-1.5 py-0.5 rounded text-accent-purple-light font-mono text-xs">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const elements = [];
  
  let currentTable = null;
  let currentList = null;
  let currentListType = null; // 'unordered' or 'ordered'
  let currentParagraph = [];

  const flushParagraph = (key) => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${key}`} className="mb-3 last:mb-0 text-text-secondary leading-relaxed">
          {renderInline(currentParagraph.join('\n'))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = (key) => {
    if (currentList) {
      if (currentListType === 'ordered') {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 mb-3 space-y-1.5 text-text-secondary text-sm">
            {currentList.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 mb-3 space-y-1.5 text-text-secondary text-sm">
            {currentList.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
          </ul>
        );
      }
      currentList = null;
      currentListType = null;
    }
  };

  const flushTable = (key) => {
    if (currentTable) {
      const rows = currentTable.map(rowStr => {
        return rowStr.split('|')
          .slice(1, -1)
          .map(cell => cell.trim());
      });

      const validRows = rows.filter(row => {
        return row.length > 0 && !row.every(cell => cell.match(/^-+$/));
      });

      if (validRows.length > 0) {
        const headers = validRows[0];
        const dataRows = validRows.slice(1);

        elements.push(
          <div key={`table-${key}`} className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-bg-primary/20 backdrop-blur-md">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 font-semibold text-text-primary">
                  {headers.map((header, idx) => (
                    <th key={idx} className="p-3 font-display">{renderInline(header)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-white/2 transition-colors text-text-secondary">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-3 whitespace-pre-line">{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      currentTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Handle Tables
    if (trimmed.startsWith('|')) {
      flushParagraph(i);
      flushList(i);
      if (!currentTable) currentTable = [];
      currentTable.push(trimmed);
      continue;
    } else {
      flushTable(i);
    }

    // 2. Handle Headers
    if (trimmed.startsWith('#')) {
      flushParagraph(i);
      flushList(i);
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const key = `h-${i}`;
        if (level === 1) elements.push(<h1 key={key} className="font-display text-lg md:text-xl font-bold text-text-primary mt-4 mb-2">{renderInline(text)}</h1>);
        else if (level === 2) elements.push(<h2 key={key} className="font-display text-base md:text-lg font-bold text-text-primary mt-3 mb-2">{renderInline(text)}</h2>);
        else elements.push(<h3 key={key} className="font-display text-sm md:text-base font-bold text-text-primary mt-2 mb-1.5">{renderInline(text)}</h3>);
        continue;
      }
    }

    // 3. Handle Lists
    const unorderedMatch = trimmed.match(/^[*+-]\s+(.*)$/);
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

    if (unorderedMatch) {
      flushParagraph(i);
      if (currentListType === 'ordered') flushList(i);
      if (!currentList) {
        currentList = [];
        currentListType = 'unordered';
      }
      currentList.push(unorderedMatch[1]);
      continue;
    } else if (orderedMatch) {
      flushParagraph(i);
      if (currentListType === 'unordered') flushList(i);
      if (!currentList) {
        currentList = [];
        currentListType = 'ordered';
      }
      currentList.push(orderedMatch[2]);
      continue;
    } else {
      if (trimmed === '') {
        flushList(i);
      }
    }

    // 4. Handle Paragraph text lines
    if (trimmed === '') {
      flushParagraph(i);
    } else {
      currentParagraph.push(line);
    }
  }

  flushParagraph(lines.length);
  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
};

export default MarkdownRenderer;
