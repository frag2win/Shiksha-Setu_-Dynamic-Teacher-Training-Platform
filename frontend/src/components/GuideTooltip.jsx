import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Lightbulb, ChevronRight } from 'lucide-react';

// Dictionary of terms and their explanations
const termsDictionary = {
  'RAG': {
    title: 'RAG (Retrieval-Augmented Generation)',
    description: 'A technique that combines information retrieval with AI text generation. It first finds relevant documents, then uses AI to generate responses based on that context.',
    example: 'Like a librarian who first finds relevant books, then summarizes them for you.'
  },
  'Cluster': {
    title: 'School Cluster',
    description: 'A group of schools with similar characteristics like location type, language, infrastructure constraints, and challenges.',
    example: 'Tribal Belt Schools in Gadchiroli with Gondi-speaking students and limited electricity.'
  },
  'DIET': {
    title: 'DIET (District Institute of Education and Training)',
    description: 'Government institutions responsible for training teachers at the district level in India.',
    example: 'Each district has a DIET that conducts in-service teacher training programs.'
  },
  'Indexing': {
    title: 'Document Indexing',
    description: 'The process of analyzing and organizing PDF content so it can be quickly searched and retrieved by the AI.',
    example: 'Like creating a detailed table of contents for a library book.'
  },
  'Module': {
    title: 'Training Module',
    description: 'An adapted version of training content customized for a specific cluster\'s needs, constraints, and context.',
    example: 'A science lesson rewritten for rural schools without lab equipment.'
  },
  'Llama': {
    title: 'Llama 3.3-70B',
    description: 'An advanced open-source AI language model by Meta with 70 billion parameters, used for generating human-like text.',
    example: 'Powers the AI adaptation engine in Shiksha-Setu.'
  },
  'Vector Store': {
    title: 'Vector Store (ChromaDB)',
    description: 'A database that stores text as mathematical vectors, enabling semantic search based on meaning rather than exact keywords.',
    example: 'Find content about "photosynthesis" even if searching for "how plants make food".'
  },
  'NCF': {
    title: 'NCF (National Curriculum Framework)',
    description: 'Guidelines issued by NCERT that provide a framework for school education curriculum in India.',
    example: 'NCF 2023 emphasizes competency-based learning and local context.'
  },
  'Adaptation': {
    title: 'Content Adaptation',
    description: 'The process of modifying standard training content to suit local contexts, constraints, and needs of specific school clusters.',
    example: 'Replacing "use the projector" with "draw on the blackboard" for schools without electricity.'
  },
  'GROQ': {
    title: 'GROQ API',
    description: 'A fast inference platform that runs AI models like Llama. Provides API access for generating AI responses.',
    example: 'The service that powers the AI content generation in this platform.'
  }
};

// Guide Tooltip Component
export const GuideTooltip = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  const info = termsDictionary[term];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!info) return children;

  return (
    <span className="guide-tooltip-wrapper" ref={tooltipRef}>
      <span 
        className="guide-tooltip-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
        <HelpCircle size={14} className="help-icon" />
      </span>
      
      {isOpen && (
        <div className="guide-tooltip-popup">
          <div className="tooltip-header">
            <Lightbulb size={18} />
            <span>{info.title}</span>
            <button onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>
          <p className="tooltip-description">{info.description}</p>
          {info.example && (
            <div className="tooltip-example">
              <ChevronRight size={14} />
              <span>{info.example}</span>
            </div>
          )}
        </div>
      )}
    </span>
  );
};

// Interactive Onboarding Tour
export const OnboardingTour = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Shiksha-Setu! 🎓',
      content: 'Transform standardized teacher training into personalized learning experiences for every school cluster.',
      icon: '✨'
    },
    {
      title: 'Upload Training Manuals',
      content: 'Start by uploading state training PDF manuals. Our AI will index and analyze the content for you.',
      icon: '📚'
    },
    {
      title: 'Create School Clusters',
      content: 'Define unique school profiles with specific constraints like region type, language, and infrastructure.',
      icon: '🏫'
    },
    {
      title: 'Generate Adapted Modules',
      content: 'Our AI (Llama 3.3) rewrites training content to match each cluster\'s unique context and needs.',
      icon: '🤖'
    },
    {
      title: 'Translate & Share',
      content: 'Translate content into 12 Indian languages and share with teachers via WhatsApp or PDF.',
      icon: '🌐'
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-progress">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            />
          ))}
        </div>
        
        <div className="onboarding-content">
          <div className="onboarding-icon">{steps[step].icon}</div>
          <h2>{steps[step].title}</h2>
          <p>{steps[step].content}</p>
        </div>

        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn-tour-secondary" onClick={handlePrev}>
              Previous
            </button>
          )}
          <button className="btn-tour-primary" onClick={handleNext}>
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        <button className="onboarding-skip" onClick={onClose}>
          Skip Tour
        </button>
      </div>
    </div>
  );
};

// Floating Help Button
export const FloatingHelp = ({ onOpenTour }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-help">
      {isOpen && (
        <div className="help-menu">
          <button onClick={onOpenTour}>
            <Lightbulb size={18} />
            Take a Tour
          </button>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <HelpCircle size={18} />
            Documentation
          </a>
        </div>
      )}
      <button 
        className="help-fab"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle size={24} />
      </button>
    </div>
  );
};

export default GuideTooltip;
