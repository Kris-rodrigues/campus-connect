import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AiModal.css';

// Strip LaTeX $ delimiters and convert common LaTeX to plain text
const cleanLatex = (text) => {
  if (!text) return '';
  let result = text
    // Remove LaTeX environments
    .replace(/\\begin\{[^}]*\}/g, '')
    .replace(/\\end\{[^}]*\}/g, '')
    // Remove display math delimiters
    .replace(/\$\$(.*?)\$\$/gs, '$1')
    .replace(/\\\[(.*?)\\\]/gs, '$1')
    // Remove inline math delimiters
    .replace(/\$(.*?)\$/g, '$1')
    .replace(/\\\((.*?)\\\)/g, '$1')
    // Operators
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\oplus/g, '⊕')
    .replace(/\\otimes/g, '⊗')
    .replace(/\\cap/g, '∩')
    .replace(/\\cup/g, '∪')
    .replace(/\\land/g, '∧')
    .replace(/\\lor/g, '∨')
    .replace(/\\lnot/g, '¬')
    .replace(/\\neg/g, '¬')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\to/g, '→')
    .replace(/\\implies/g, '⇒')
    // Comparisons
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\equiv/g, '≡')
    .replace(/\\sim/g, '~')
    .replace(/\\subset/g, '⊂')
    .replace(/\\supset/g, '⊃')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    // Symbols
    .replace(/\\infty/g, '∞')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    // Greek letters
    .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β').replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ').replace(/\\epsilon/g, 'ε').replace(/\\zeta/g, 'ζ')
    .replace(/\\eta/g, 'η').replace(/\\theta/g, 'θ').replace(/\\iota/g, 'ι')
    .replace(/\\kappa/g, 'κ').replace(/\\lambda/g, 'λ').replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν').replace(/\\xi/g, 'ξ').replace(/\\pi/g, 'π')
    .replace(/\\rho/g, 'ρ').replace(/\\sigma/g, 'σ').replace(/\\tau/g, 'τ')
    .replace(/\\phi/g, 'φ').replace(/\\chi/g, 'χ').replace(/\\psi/g, 'ψ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Gamma/g, 'Γ').replace(/\\Delta/g, 'Δ').replace(/\\Theta/g, 'Θ')
    .replace(/\\Lambda/g, 'Λ').replace(/\\Pi/g, 'Π').replace(/\\Sigma/g, 'Σ')
    .replace(/\\Phi/g, 'Φ').replace(/\\Psi/g, 'Ψ').replace(/\\Omega/g, 'Ω')
    // Math functions
    .replace(/\\sum/g, 'Σ')
    .replace(/\\prod/g, 'Π')
    .replace(/\\int/g, '∫')
    .replace(/\\sqrt\{(.*?)\}/g, '√($1)')
    .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1/$2)')
    .replace(/\\log/g, 'log')
    .replace(/\\ln/g, 'ln')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\min/g, 'min')
    .replace(/\\max/g, 'max')
    // Spacing and formatting
    .replace(/\\quad/g, '  ')
    .replace(/\\qquad/g, '    ')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\!/g, '')
    .replace(/\\text\{(.*?)\}/g, '$1')
    .replace(/\\textbf\{(.*?)\}/g, '**$1**')
    .replace(/\\textit\{(.*?)\}/g, '*$1*')
    .replace(/\\mathrm\{(.*?)\}/g, '$1')
    .replace(/\\mathbf\{(.*?)\}/g, '$1')
    // Braces cleanup: ^{...} → ^... and _{...} → _...
    .replace(/\^(\{.*?\})/g, (_, p) => `^${p.slice(1, -1)}`)
    .replace(/_(\{.*?\})/g, (_, p) => `_${p.slice(1, -1)}`)
    // Alignment markers
    .replace(/&=/g, '= ')
    .replace(/&/g, ' ')
    // Remaining backslash commands (catch-all for anything missed)
    .replace(/\\[a-zA-Z]+/g, '')
    // Double backslashes (line breaks in LaTeX)
    .replace(/\\\\/g, '; ')
    // Clean up extra whitespace
    .replace(/  +/g, ' ')
    .trim();

  // Now convert ^superscripts and _subscripts to Unicode
  result = result.replace(/\^([a-zA-Z0-9!+\-()]+)/g, (_, sup) => toSuperscript(sup));
  result = result.replace(/_([a-zA-Z0-9!+\-()]+)/g, (_, sub) => toSubscript(sub));
  
  return result;
};

const superMap = {
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  'a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ',
  'j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','r':'ʳ','s':'ˢ',
  't':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ',
  '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾','!':'ᵎ',
  'A':'ᴬ','B':'ᴮ','D':'ᴰ','E':'ᴱ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ',
  'L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','R':'ᴿ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ'
};

const subMap = {
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
  'a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ',
  'o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ',
  '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎'
};

const toSuperscript = (str) => str.split('').map(c => superMap[c] || c).join('');
const toSubscript = (str) => str.split('').map(c => subMap[c] || c).join('');

const AiModal = ({ mode, content, isLoading, closeModal }) => {
  // Determine the title based on the AI mode
  let title = 'AI Feature';
  if (mode === 'summary') title = 'Summary';
  else if (mode === 'quiz') title = 'Generated Quiz'; // Updated title
  else if (mode === 'qa') title = 'Generated Q&A';

  const cleanedContent = cleanLatex(content);

  return (
    <div className="ai-modal-overlay" onClick={closeModal}>
      <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
        <button className="ai-close-btn" onClick={closeModal}>&times;</button>
        <h2>{title}</h2>
        <div className="ai-result-box markdown-body">
          {isLoading ? (
            <p className="loading-text">Generating response...</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanedContent}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiModal;