import React, { useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export interface MathRendererProps {
  math?: string;
  text?: string;
  content?: string;
  children?: React.ReactNode;
  block?: boolean;
  className?: string;
}

export interface TextSegment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

/**
 * Detects whether a string contains LaTeX mathematical notation.
 * Checks for:
 * - Block math delimiters: $$...$$, \[...\]
 * - Inline math delimiters: $...$, \(...\)
 * - Markdown math fences: ```latex ... ```, ```math ... ```
 * - Common LaTeX macros: \frac, \vec, \sqrt, \int, \sum, \Delta, \theta, etc.
 */
export function hasLatexPattern(input?: string): boolean {
  if (!input || typeof input !== 'string') return false;

  // Delimiters
  if (
    input.includes('$$') ||
    input.includes('\\[') ||
    input.includes('\\(') ||
    /```(?:latex|katex|math)/i.test(input) ||
    /\$[^\$\n]+?\$/.test(input)
  ) {
    return true;
  }

  // Common LaTeX commands & symbols
  return /\\(?:frac|dfrac|cfrac|sqrt|sum|int|iint|iiint|oint|prod|vec|hat|bar|dot|ddot|partial|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|infty|times|cdot|circ|approx|sim|ne|neq|le|leq|ge|geq|pm|mp|mathbf|mathrm|text|to|implies|iff|nabla|over|choose)\b/i.test(
    input
  );
}

/**
 * Extracts and classifies LaTeX expressions from a mixed markdown/text message.
 * Supports:
 * - ```latex ... ``` and ```math ... ``` fences (Block math)
 * - $$ ... $$ (Block math)
 * - \[ ... \] (Block math)
 * - $ ... $   (Inline math)
 * - \( ... \) (Inline math)
 * - Standalone raw LaTeX strings
 * - Un-delimited LaTeX macros (e.g. \vec{F} = m\vec{a})
 */
export function extractLatexSegments(input: string): TextSegment[] {
  if (!input) return [];

  const trimmed = input.trim();

  // Check if the entire string is a single standalone LaTeX or algebraic expression without delimiters
  const isPureMath =
    !input.includes('$') &&
    !input.includes('\n') &&
    trimmed.length > 0 &&
    (trimmed.startsWith('\\') ||
      /\\(?:frac|dfrac|cfrac|sqrt|sum|int|vec|partial|alpha|beta|gamma|delta|theta|omega|mu|lambda|sigma|pi|infty|times|cdot|approx|ne|le|ge|pm|mathbf|mathrm|Delta|nabla)\b/i.test(trimmed) ||
      trimmed.includes('^\\circ') ||
      (/^[a-zA-Z0-9\s\+\-\*\/\=\(\)\_\^\{\}\.,\\~]+$/.test(trimmed) &&
        (trimmed.includes('=') || trimmed.includes('^') || trimmed.includes('_')) &&
        !/\b(?:the|is|and|or|in|of|to|what|how|where|when|which|calculate|determine|solve|find|given|force|mass|speed|velocity|acceleration)\b/i.test(trimmed)));

  if (isPureMath) {
    return [{ type: 'inline-math', content: trimmed }];
  }

  const segments: TextSegment[] = [];
  // Regex to match markdown math blocks, block math ($$...$$ or \[...\]) or inline math ($...$ or \(...\))
  const regex =
    /(```(?:latex|katex|math)\s*[\s\S]+?```|\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\)|(?:\\[a-zA-Z]+(?:\{[^{}\n]*\}|\[[^\]\n]*\])*(?:[\^_](?:\{[^{}\n]*\}|[a-zA-Z0-9]))*(?:\s*[\=\+\-\*\/\<\>]\s*(?:\\[a-zA-Z]+(?:\{[^{}\n]*\}|\[[^\]\n]*\])*|[a-zA-Z0-9\.\,\_\{\}\^]+))*))/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: input.substring(lastIndex, match.index),
      });
    }

    let matchedStr = match[0];

    // If it's an un-delimited match ending with trailing punctuation like period or comma, peel it off
    let trailingPunctuation = '';
    if (!matchedStr.startsWith('$') && !matchedStr.startsWith('`') && !matchedStr.startsWith('\\[') && !matchedStr.startsWith('\\(')) {
      const punctMatch = matchedStr.match(/[.,!?;:]+$/);
      if (punctMatch) {
        trailingPunctuation = punctMatch[0];
        matchedStr = matchedStr.slice(0, -trailingPunctuation.length);
      }
    }

    if (/^```(?:latex|katex|math)/i.test(matchedStr) && matchedStr.endsWith('```')) {
      const inner = matchedStr
        .replace(/^```(?:latex|katex|math)\s*/i, '')
        .replace(/```$/, '')
        .trim();
      segments.push({
        type: 'block-math',
        content: inner,
      });
    } else if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      segments.push({
        type: 'block-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('\\[') && matchedStr.endsWith('\\]')) {
      segments.push({
        type: 'block-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      segments.push({
        type: 'inline-math',
        content: matchedStr.slice(1, -1).trim(),
      });
    } else if (matchedStr.startsWith('\\(') && matchedStr.endsWith('\\)')) {
      segments.push({
        type: 'inline-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.trim()) {
      // Un-delimited LaTeX formula segment
      segments.push({
        type: 'inline-math',
        content: matchedStr.trim(),
      });
    }

    if (trailingPunctuation) {
      segments.push({
        type: 'text',
        content: trailingPunctuation,
      });
    }

    lastIndex = match.index + match[0].length;

    // Safety guard to avoid any zero-length infinite loop
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  if (lastIndex < input.length) {
    segments.push({
      type: 'text',
      content: input.substring(lastIndex),
    });
  }

  return segments;
}

/**
 * Handles markdown bold (**...**) and line breaks in plain text segments
 */
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-[var(--text-primary)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.includes('\n')) {
          const lines = part.split('\n');
          return (
            <React.Fragment key={index}>
              {lines.map((line, lIdx) => (
                <React.Fragment key={lIdx}>
                  {lIdx > 0 && <br className="my-1" />}
                  {line}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

// Safe wrapper around react-katex InlineMath
const SafeInlineMath: React.FC<{ math: string }> = ({ math }) => {
  if (!math || !math.trim()) return null;
  try {
    return (
      <InlineMath
        math={math.trim()}
        errorColor="#d97706"
        renderError={() => (
          <code className="font-mono dark:text-amber-300 text-amber-800 text-xs px-1 dark:bg-amber-950/40 bg-amber-100/90 rounded border border-amber-300/40">
            {math}
          </code>
        )}
      />
    );
  } catch {
    return <code className="font-mono dark:text-amber-300 text-amber-800 text-xs px-1 dark:bg-amber-950/40 bg-amber-100/90 rounded border border-amber-300/40">{math}</code>;
  }
};

// Safe wrapper around react-katex BlockMath
const SafeBlockMath: React.FC<{ math: string }> = ({ math }) => {
  if (!math || !math.trim()) return null;
  try {
    return (
      <BlockMath
        math={math.trim()}
        errorColor="#d97706"
        renderError={() => (
          <pre className="font-mono dark:text-amber-300 text-amber-800 text-xs p-2 dark:bg-amber-950/40 bg-amber-100/90 rounded overflow-x-auto my-2 border border-amber-300/40">
            {math}
          </pre>
        )}
      />
    );
  } catch {
    return (
      <pre className="font-mono dark:text-amber-300 text-amber-800 text-xs p-2 dark:bg-amber-950/40 bg-amber-100/90 rounded overflow-x-auto my-2 border border-amber-300/40">
        {math}
      </pre>
    );
  }
};

/**
 * Reusable MathRenderer component powered by react-katex.
 * Designed to render LaTeX expressions inside messages, cards, and equations.
 * Handles both inline and block math formatting consistently across the app.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  text,
  content,
  children,
  block = false,
  className = '',
}) => {
  const rawContent =
    math ??
    text ??
    content ??
    (typeof children === 'string' ? children : '') ??
    '';

  // If explicitly flagged as block math without delimiters
  if (block && !rawContent.includes('$') && !rawContent.includes('\\(') && !rawContent.includes('\\[')) {
    return (
      <div className={`my-2 overflow-x-auto py-1 text-center ${className}`}>
        <SafeBlockMath math={rawContent} />
      </div>
    );
  }

  // If explicitly passed via math prop without delimiters
  if (math !== undefined && !rawContent.includes('$') && !rawContent.includes('\\(') && !rawContent.includes('\\[')) {
    return (
      <span className={`inline-block mx-0.5 px-0.5 align-baseline ${className}`}>
        <SafeInlineMath math={rawContent} />
      </span>
    );
  }

  const segments = useMemo(() => extractLatexSegments(rawContent), [rawContent]);

  return (
    <span className={`inline-block align-middle max-w-full leading-relaxed ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'block-math') {
          return (
            <div key={idx} className="my-3 overflow-x-auto py-1 text-center">
              <SafeBlockMath math={seg.content} />
            </div>
          );
        }
        if (seg.type === 'inline-math') {
          return (
            <span key={idx} className="inline-block mx-0.5 px-0.5 align-baseline">
              <SafeInlineMath math={seg.content} />
            </span>
          );
        }
        return <FormattedText key={idx} text={seg.content} />;
      })}
    </span>
  );
};

export default MathRenderer;
