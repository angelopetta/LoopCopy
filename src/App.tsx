import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import Markdown from 'react-markdown';
import { 
  Sparkles, RotateCcw, History, ArrowRight, CheckCircle2, 
  Loader2, FileText, MessageSquare, Box, Settings2, 
  Wand2, X, Plus, Target, Heart, Mic, Brain, Zap, LayoutTemplate, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type AppState = 'setup_seed' | 'setup_analyzing' | 'setup_configuring' | 'workspace_idle' | 'processing_initial' | 'output' | 'processing_feedback';

interface Version {
  id: number;
  prompt: string;
  output: string;
  feedback?: string;
}

interface BlackBoxParams {
  audiences: string[];
  values: string[];
  tones: string[];
  angles: string[];
  emotions: string[];
  frameworks: string[];
  objectives: string[];
}

const emptyParams: BlackBoxParams = { 
  audiences: [], values: [], tones: [], 
  angles: [], emotions: [], frameworks: [], objectives: [] 
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('setup_seed');
  
  // Black Box State
  const [brandSeed, setBrandSeed] = useState('');
  const [suggestions, setSuggestions] = useState<BlackBoxParams>(emptyParams);
  const [activeParams, setActiveParams] = useState<BlackBoxParams>(emptyParams);
  
  // Loop State
  const [concept, setConcept] = useState('');
  const [feedback, setFeedback] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);
  const [generatingCategory, setGeneratingCategory] = useState<keyof BlackBoxParams | null>(null);
  
  const chatRef = useRef<Chat | null>(null);

  // --- BLACK BOX SETUP ---

  const handleAnalyzeBrand = async () => {
    if (!brandSeed.trim()) return;
    setAppState('setup_analyzing');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are the world's greatest direct-response and social media copywriter. Analyze this brand/company description and generate the ultimate psychological and structural parameters for a copywriting AI engine: "${brandSeed}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              audiences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 ultra-specific target audience segments (e.g., 'Time-starved millennial founders', 'Eco-anxious urbanites')" },
              values: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 core brand values to implicitly weave into the copy (e.g., 'Radical Transparency', 'Relentless Innovation')" },
              tones: { type: Type.ARRAY, items: { type: Type.STRING }, description: "6 distinct tones of voice (e.g., 'Conversational & Witty', 'Authoritative & Strategic', 'Empathetic & Warm')" },
              angles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 psychological hooks/angles (e.g., 'The Contrarian Take', 'FOMO & Scarcity', 'Curiosity Gap', 'Story-Driven/Vulnerable')" },
              emotions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 desired emotional responses from the reader (e.g., 'Empowered', 'Understood', 'Urgent Action', 'Amused')" },
              frameworks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 proven copywriting frameworks (e.g., 'Problem-Agitate-Solve (PAS)', 'Attention-Interest-Desire-Action (AIDA)', 'Before-After-Bridge (BAB)')" },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 primary conversion objectives (e.g., 'Drive Link Clicks', 'Spark Debate/Comments', 'Save for Later', 'Direct Sales')" }
            },
            required: ["audiences", "values", "tones", "angles", "emotions", "frameworks", "objectives"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}') as BlackBoxParams;
      setSuggestions(data);
      
      // Auto-select a strong default combination
      setActiveParams({
        audiences: data.audiences?.slice(0, 1) || [],
        values: data.values?.slice(0, 1) || [],
        tones: data.tones?.slice(0, 1) || [],
        angles: data.angles?.slice(0, 1) || [],
        emotions: data.emotions?.slice(0, 1) || [],
        frameworks: data.frameworks?.slice(0, 1) || [],
        objectives: data.objectives?.slice(0, 1) || []
      });
      
      setAppState('setup_configuring');
    } catch (error) {
      console.error(error);
      alert("Failed to analyze brand. Please try again.");
      setAppState('setup_seed');
    }
  };

  const toggleParam = (category: keyof BlackBoxParams, value: string) => {
    setActiveParams(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const finalizeSetup = () => {
    setAppState('workspace_idle');
  };

  const handleGenerateMore = async (category: keyof BlackBoxParams) => {
    setGeneratingCategory(category);
    try {
      const existing = suggestions[category].join(', ');
      const promptMap: Record<keyof BlackBoxParams, string> = {
        audiences: "target audience segments",
        values: "core brand values",
        tones: "tones of voice",
        angles: "psychological hooks/angles",
        emotions: "desired emotional responses",
        frameworks: "copywriting frameworks",
        objectives: "conversion objectives"
      };
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Brand: "${brandSeed}"\n\nGenerate 4 MORE unique ${promptMap[category]} for a copywriting AI. They MUST be completely different from these existing ones: ${existing}. Return ONLY a JSON array of 4 strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const newItems = JSON.parse(response.text || '[]');
      setSuggestions(prev => ({
        ...prev,
        [category]: [...prev[category], ...newItems]
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to generate more options.");
    } finally {
      setGeneratingCategory(null);
    }
  };

  // --- THE LOOP ---

  const buildSystemInstruction = () => {
    return `You are an elite, world-class copywriter operating inside a highly configured closed-loop system. You write copy that converts, resonates, and stops the scroll.
    
CRITICAL SYSTEM PARAMETERS (The Black Box):
- Target Audience: ${activeParams.audiences.join(', ') || 'General Audience'}
- Core Brand Values: ${activeParams.values.join(', ') || 'Standard'}
- Tone of Voice: ${activeParams.tones.join(', ') || 'Professional'}
- Psychological Angle/Hook: ${activeParams.angles.join(', ') || 'Direct'}
- Desired Reader Emotion: ${activeParams.emotions.join(', ') || 'Interested'}
- Copywriting Framework: ${activeParams.frameworks.join(', ') || 'Standard'}
- Primary Objective: ${activeParams.objectives.join(', ') || 'Inform'}

INSTRUCTIONS:
1. The user will provide a concept. Generate the absolute best possible written copy adhering STRICTLY to the parameters above.
2. Structure the copy using the requested 'Copywriting Framework'.
3. Hook the reader using the requested 'Psychological Angle'.
4. Ensure the copy evokes the 'Desired Reader Emotion' and drives towards the 'Primary Objective'.
5. The user may provide feedback on your output. You must analyze the feedback, adjust your internal weights, and generate a revised version.
6. Always provide the full revised copy in your response without conversational filler.`;
  };

  const handleGenerateInitial = async () => {
    if (!concept.trim()) return;
    setAppState('processing_initial');

    try {
      chatRef.current = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: buildSystemInstruction(),
        }
      });

      const response = await chatRef.current.sendMessage({ message: `Concept to write about: ${concept}` });
      
      setVersions([{ id: 1, prompt: concept, output: response.text || '' }]);
      setCurrentVersionIndex(0);
      setAppState('output');
    } catch (error) {
      console.error(error);
      setAppState('workspace_idle');
      alert("An error occurred while generating copy.");
    }
  };

  const handleProvideFeedback = async () => {
    if (!feedback.trim() || !chatRef.current) return;
    
    const updatedVersions = [...versions];
    updatedVersions[currentVersionIndex].feedback = feedback;
    setVersions(updatedVersions);

    setAppState('processing_feedback');

    try {
      // Re-inject system instructions in case parameters changed
      const response = await chatRef.current.sendMessage({ 
        message: `SYSTEM UPDATE: Ensure you are strictly following these parameters: Audience(${activeParams.audiences.join(', ')}), Values(${activeParams.values.join(', ')}), Tone(${activeParams.tones.join(', ')}), Angle(${activeParams.angles.join(', ')}), Emotion(${activeParams.emotions.join(', ')}), Framework(${activeParams.frameworks.join(', ')}), Objective(${activeParams.objectives.join(', ')}).\n\nUSER FEEDBACK on previous output: ${feedback}\n\nPlease provide the revised copy.` 
      });
      
      const newVersion: Version = {
        id: versions.length + 1,
        prompt: concept,
        output: response.text || '',
      };
      setVersions([...updatedVersions, newVersion]);
      setCurrentVersionIndex(updatedVersions.length);
      setFeedback('');
      setAppState('output');
    } catch (error) {
      console.error(error);
      setAppState('output');
      alert("An error occurred while processing feedback.");
    }
  };

  const handleReset = () => {
    setAppState('setup_seed');
    setBrandSeed('');
    setConcept('');
    setFeedback('');
    setVersions([]);
    setCurrentVersionIndex(0);
    setActiveParams(emptyParams);
    chatRef.current = null;
  };

  const currentVersion = versions[currentVersionIndex];

  // --- RENDER HELPERS ---

  const renderParamSection = (title: string, icon: React.ReactNode, category: keyof BlackBoxParams) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center uppercase tracking-wider">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions[category].map(item => {
          const isActive = activeParams[category].includes(item);
          return (
            <button
              key={item}
              onClick={() => toggleParam(category, item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border text-left ${
                isActive 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-800 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              {item}
              {isActive && <X className="w-3 h-3 inline-block ml-1.5 opacity-60" />}
            </button>
          );
        })}
        <button
          onClick={() => handleGenerateMore(category)}
          disabled={generatingCategory === category}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingCategory === category ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          )}
          Suggest More
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 p-2 rounded-lg shadow-inner">
            <Box className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">LoopCopy</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Elite Copywriting Engine</p>
          </div>
        </div>
        {appState !== 'setup_seed' && (
          <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center">
            <RotateCcw className="w-4 h-4 mr-2" /> Start Over
          </button>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* PHASE 1: SEED & ANALYZE */}
          {(appState === 'setup_seed' || appState === 'setup_analyzing') && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex items-center justify-center p-6 bg-slate-50 z-10"
            >
              <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
                    <Wand2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight text-slate-900">Define the Black Box</h2>
                  <p className="text-lg text-slate-500">Tell us briefly about your brand or project. Our AI will generate the ultimate psychological and structural parameters to configure your custom copywriting engine.</p>
                </div>
                
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                  <textarea
                    value={brandSeed}
                    onChange={(e) => setBrandSeed(e.target.value)}
                    disabled={appState === 'setup_analyzing'}
                    placeholder="e.g., We are a B2B SaaS company selling AI analytics to enterprise marketing teams. We want to sound smart, authoritative, but approachable."
                    className="w-full h-32 p-4 bg-transparent border-none resize-none focus:ring-0 text-lg placeholder:text-slate-400 disabled:opacity-50"
                  />
                  <div className="flex justify-end p-2">
                    <button
                      onClick={handleAnalyzeBrand}
                      disabled={!brandSeed.trim() || appState === 'setup_analyzing'}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-colors"
                    >
                      {appState === 'setup_analyzing' ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Brand...</>
                      ) : (
                        <><Settings2 className="w-5 h-5 mr-2" /> Generate Parameters</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: CONFIGURE MODULES */}
          {appState === 'setup_configuring' && (
            <motion.div 
              key="configure"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-6 bg-slate-50/80 backdrop-blur-sm z-10 overflow-y-auto"
            >
              <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden my-8">
                <div className="p-8 border-b border-slate-100 bg-slate-900 text-white">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Box className="w-6 h-6 mr-3 text-indigo-400" />
                    Configure Black Box Parameters
                  </h2>
                  <p className="text-slate-400 mt-2">The AI has generated world-class copywriting parameters based on your brand. Select the active modules for your engine.</p>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {renderParamSection("Target Audience", <Target className="w-4 h-4" />, "audiences")}
                  {renderParamSection("Core Values", <Heart className="w-4 h-4" />, "values")}
                  {renderParamSection("Tone of Voice", <Mic className="w-4 h-4" />, "tones")}
                  {renderParamSection("Psychological Angle", <Brain className="w-4 h-4" />, "angles")}
                  {renderParamSection("Desired Emotion", <Zap className="w-4 h-4" />, "emotions")}
                  {renderParamSection("Copy Framework", <LayoutTemplate className="w-4 h-4" />, "frameworks")}
                  {renderParamSection("Primary Objective", <Flag className="w-4 h-4" />, "objectives")}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={finalizeSetup}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center shadow-sm"
                  >
                    Initialize System <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: THE WORKSPACE (Black Box + Loop) */}
          {(appState === 'workspace_idle' || appState === 'processing_initial' || appState === 'output' || appState === 'processing_feedback') && (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 flex w-full h-full overflow-hidden"
            >
              {/* LEFT SIDEBAR: The Black Box Parameters */}
              <div className="w-80 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 overflow-y-auto">
                <div className="p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center">
                    <Settings2 className="w-4 h-4 mr-2 text-indigo-400" />
                    Active Parameters
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Tweaking these will drastically alter the next generation.</p>
                </div>
                
                <div className="p-5 space-y-8">
                  {(['audiences', 'values', 'tones', 'angles', 'emotions', 'frameworks', 'objectives'] as const).map(category => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {suggestions[category].map(item => {
                          const isActive = activeParams[category].includes(item);
                          return (
                            <button
                              key={item}
                              onClick={() => toggleParam(category, item)}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center text-left group ${
                                isActive 
                                  ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-500' 
                                  : 'bg-transparent text-slate-500 border border-dashed border-slate-700 hover:text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {!isActive && <Plus className="w-3 h-3 mr-1.5 opacity-60 group-hover:opacity-100 shrink-0" />}
                              <span>{item}</span>
                              {isActive && <X className="w-3 h-3 ml-1.5 opacity-40 group-hover:opacity-100 group-hover:text-red-400 shrink-0" />}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handleGenerateMore(category)}
                          disabled={generatingCategory === category}
                          className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-dashed border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:border-indigo-400 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingCategory === category ? (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 mr-1.5" />
                          )}
                          More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT AREA: The Loop */}
              <div className="flex-1 flex flex-col bg-white relative">
                
                {/* Processing Overlay */}
                <AnimatePresence>
                  {(appState === 'processing_initial' || appState === 'processing_feedback') && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center"
                    >
                      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full">
                        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                        <h3 className="text-lg font-semibold">
                          {appState === 'processing_initial' ? 'Running Black Box...' : 'Applying Feedback...'}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2 text-center">Processing through active parameters and generating copy.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Top: Concept Input */}
                <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                  <div className="max-w-4xl mx-auto flex gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        placeholder="What specific piece of copy do you need right now? (e.g., 'Instagram post announcing our summer sale')"
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateInitial()}
                      />
                    </div>
                    <button
                      onClick={handleGenerateInitial}
                      disabled={!concept.trim() || appState.includes('processing')}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium flex items-center shadow-sm whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Generate
                    </button>
                  </div>
                </div>

                {/* Middle: Output & History */}
                {appState === 'workspace_idle' ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center">
                    <div>
                      <Box className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">The Black Box is configured and ready.</p>
                      <p className="text-sm mt-2">Enter a concept above to generate your first piece of copy.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Output Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-white">
                      <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                          <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                            Generated Copy <span className="ml-3 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-mono">v{currentVersion?.id}</span>
                          </h2>
                          <button 
                            onClick={() => navigator.clipboard.writeText(currentVersion?.output || '')}
                            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                          >
                            Copy text
                          </button>
                        </div>
                        <div className="prose prose-slate prose-indigo max-w-none">
                          <Markdown>{currentVersion?.output || ''}</Markdown>
                        </div>
                      </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="w-72 bg-slate-50 border-l border-slate-200 flex flex-col">
                      <div className="p-4 border-b border-slate-200 font-semibold text-sm text-slate-700 flex items-center">
                        <History className="w-4 h-4 mr-2" /> Iteration History
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {versions.map((v, idx) => (
                          <div 
                            key={v.id} 
                            onClick={() => setCurrentVersionIndex(idx)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              idx === currentVersionIndex 
                                ? 'bg-white border-indigo-300 shadow-sm ring-1 ring-indigo-500/20' 
                                : 'bg-transparent border-slate-200 hover:border-indigo-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm font-bold ${idx === currentVersionIndex ? 'text-indigo-700' : 'text-slate-600'}`}>Version {v.id}</span>
                            </div>
                            {v.feedback ? (
                              <p className="text-xs text-slate-500 line-clamp-2 italic">"{v.feedback}"</p>
                            ) : (
                              <p className="text-xs text-slate-400">Initial generation</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom: Feedback Loop */}
                {appState === 'output' && currentVersionIndex === versions.length - 1 && (
                  <div className="p-6 border-t border-slate-200 bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
                    <div className="max-w-4xl mx-auto">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
                        Assess & Refine (The Loop)
                      </label>
                      <div className="flex gap-4">
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="What should be improved? (e.g., 'Make it punchier', 'Focus more on the sustainability value')"
                          className="flex-1 h-14 min-h-[56px] max-h-32 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleProvideFeedback();
                            }
                          }}
                        />
                        <button
                          onClick={handleProvideFeedback}
                          disabled={!feedback.trim()}
                          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 rounded-xl font-medium flex items-center transition-colors shrink-0"
                        >
                          Feed back into loop <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Tip: You can also tweak the parameters in the left sidebar before submitting feedback to drastically alter the next version.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
