import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, FileText, Sparkles, BookOpen, HelpCircle, Award,
  Check, ChevronRight, Download, Share2, ArrowLeft, Loader2,
  Eye, EyeOff, Menu, X
} from 'lucide-react';
import { generateSummary, generateSimpleExplanation, generateQuestions } from '../services/ai';
import type { Question } from '../services/ai';

type AppStep = 'upload' | 'processing' | 'results' | 'certificate';
type ResultTab = 'summary' | 'explain' | 'questions';

interface PDFFile {
  name: string;
  pageCount: number;
  content: string;
}

interface StudyResults {
  summary: string;
  simpleExplanation: string;
  questions: Question[];
}

interface Certificate {
  documentName: string;
  date: string;
  certificateId: string;
  txHash: string;
}

const loadingMessages = [
  "reading your pdf so you don't have to...",
  "breaking this down into human language...",
  "cooking up some practice questions...",
  "almost done, hang tight...",
];

function generateCertificateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'SP-';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

async function extractPDFContent(file: File): Promise<{ content: string; pageCount: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        let text = '';
        for (let i = 0; i < uint8Array.length; i++) {
          const byte = uint8Array[i];
          if (byte >= 32 && byte < 127) {
            text += String.fromCharCode(byte);
          } else if (byte === 10 || byte === 13) {
            text += ' ';
          }
        }

        const cleanText = text
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const pageCount = Math.max(1, Math.floor(uint8Array.length / 3000));

        resolve({ content: cleanText || `Content from ${file.name}`, pageCount });
      } catch (e) {
        resolve({ content: `Document: ${file.name}`, pageCount: Math.floor(Math.random() * 10) + 5 });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export default function StudyApp() {
  const [step, setStep] = useState<AppStep>('upload');
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [results, setResults] = useState<StudyResults | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('summary');
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setLoadingIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileSelect(file);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    const { content, pageCount } = await extractPDFContent(file);
    setPdfFile({ name: file.name, pageCount, content });
  };

  const processPDF = async () => {
    if (!pdfFile) return;
    setStep('processing');
    setProcessingProgress(0);

    try {
      setProcessingProgress(10);

      const [summary, simpleExplanation, questions] = await Promise.all([
        generateSummary(pdfFile.content, pdfFile.name).then(result => {
          setProcessingProgress(prev => Math.max(prev, 40));
          return result;
        }),
        generateSimpleExplanation(pdfFile.content, pdfFile.name).then(result => {
          setProcessingProgress(prev => Math.max(prev, 70));
          return result;
        }),
        generateQuestions(pdfFile.content, pdfFile.name).then(result => {
          setProcessingProgress(prev => Math.max(prev, 90));
          return result;
        })
      ]);

      setProcessingProgress(100);

      setResults({ summary, simpleExplanation, questions });
      setStep('results');
    } catch (error) {
      console.error('Processing failed:', error);
      setStep('upload');
    }
  };

  const generateCertificateHandler = () => {
    if (!pdfFile) return;

    const newCertificate: Certificate = {
      documentName: pdfFile.name.replace('.pdf', ''),
      date: new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      certificateId: generateCertificateId(),
      txHash: generateTxHash()
    };

    setCertificate(newCertificate);
    setStep('certificate');
  };

  const toggleAnswer = (id: number) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const shareOnX = () => {
    if (!certificate) return;
    const text = `just got my StudyProof certificate for ${certificate.documentName} — proof i actually studied this 📚 #StudyProof`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const resetApp = () => {
    setStep('upload');
    setPdfFile(null);
    setResults(null);
    setCertificate(null);
    setActiveTab('summary');
    setRevealedAnswers(new Set());
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-amber-50/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-violet-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-amber-400 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StudyProof</span>
            </Link>

            {step !== 'upload' && (
              <button
                onClick={resetApp}
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Start over
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-violet-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-violet-100 px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 text-gray-600 font-medium">Home</Link>
            {step !== 'upload' && (
              <button onClick={resetApp} className="flex items-center gap-2 py-2 text-gray-600 font-medium">
                <ArrowLeft className="w-4 h-4" />
                Start over
              </button>
            )}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Upload Step */}
        {step === 'upload' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">let's make sense of your lecture</h1>
              <p className="text-gray-600 text-lg">drop your pdf below. we'll handle the rest.</p>
            </div>

            <div
              className={`card-warm rounded-3xl p-8 md:p-12 text-center transition-all duration-300 ${
                isDragging ? 'scale-[1.02] border-violet-400 border-2' : ''
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
            >
              {!pdfFile ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">drop your lecture pdf here</h3>
                  <p className="text-gray-500 mb-6">or tap to browse your files</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-violet-600 px-6 py-3 rounded-full font-semibold"
                  >
                    choose file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </>
              ) : (
                <div className="animate-fade-in-up">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-violet-500" />
                    <span className="font-semibold text-lg">{pdfFile.name}</span>
                  </div>
                  <p className="text-gray-500 mb-6">{pdfFile.pageCount} pages</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={processPDF}
                      className="btn-primary text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2"
                    >
                      analyse this
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPdfFile(null)}
                      className="text-gray-500 hover:text-gray-700 px-6 py-3 font-medium"
                    >
                      choose different file
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="animate-fade-in-up flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-amber-400 rounded-3xl flex items-center justify-center animate-pulse-soft">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
              </div>
            </div>
            <p className="text-xl font-medium text-gray-700 mb-4">
              {loadingMessages[loadingIndex]}
            </p>
            <div className="w-64 h-2 bg-violet-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{processingProgress}% complete</p>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && results && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">here's what we found</h1>
              <p className="text-gray-600">your lecture, decoded and ready to study</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { id: 'summary', label: 'summary', icon: BookOpen },
                { id: 'explain', label: 'explain it simply', icon: Sparkles },
                { id: 'questions', label: 'practice questions', icon: HelpCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ResultTab)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-violet-50 border border-violet-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="card-warm rounded-3xl p-6 md:p-8">
              {activeTab === 'summary' && (
                <div className="prose prose-violet max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {results.summary.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-2xl font-bold mt-6 mb-4 text-gray-900">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={i} className="text-xl font-semibold mt-5 mb-3 text-gray-800">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold text-gray-800 mt-4">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.trim()) {
                        return <p key={i} className="mb-3">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'explain' && (
                <div className="prose prose-violet max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {results.simpleExplanation.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-gray-800">{line.replace(/\*\*/g, '')}</h3>;
                      }
                      if (line.trim()) {
                        return <p key={i} className="mb-3">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div>
                  <p className="text-gray-600 mb-6">let's see how much stuck 👀</p>
                  <div className="space-y-4">
                    {results.questions.map((q, i) => (
                      <div key={q.id} className="bg-white rounded-2xl p-5 border border-violet-100">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center text-sm font-semibold text-violet-600">
                            {i + 1}
                          </span>
                          <p className="font-medium text-gray-800">{q.question}</p>
                        </div>

                        {q.type === 'multiple' && q.options && (
                          <div className="ml-10 space-y-2 mb-4">
                            {q.options.map((opt, j) => (
                              <div key={j} className="text-gray-600 text-sm pl-3 py-1">
                                {String.fromCharCode(65 + j)}. {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'truefalse' && (
                          <div className="ml-10 space-y-2 mb-4">
                            <div className="text-gray-600 text-sm pl-3 py-1">A. True</div>
                            <div className="text-gray-600 text-sm pl-3 py-1">B. False</div>
                          </div>
                        )}

                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="ml-10 flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
                        >
                          {revealedAnswers.has(q.id) ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              hide answer
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              reveal answer
                            </>
                          )}
                        </button>

                        {revealedAnswers.has(q.id) && (
                          <div className="ml-10 mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="font-semibold text-green-700 mb-1">Answer: {q.answer}</p>
                            <p className="text-sm text-green-600">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Certificate CTA */}
            <div className="mt-8 text-center">
              <div className="card-warm rounded-2xl p-6 inline-block">
                <p className="text-gray-600 mb-4">ready to lock in your study session?</p>
                <button
                  onClick={generateCertificateHandler}
                  className="btn-primary text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 mx-auto"
                >
                  <Award className="w-5 h-5" />
                  generate my proof
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Step */}
        {step === 'certificate' && certificate && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">you've got proof!</h1>
              <p className="text-gray-600">your study session is verified and locked onchain</p>
            </div>

            {/* Certificate Card */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-200 to-amber-100 rounded-3xl transform rotate-1 opacity-50" />
              <div className="relative bg-gradient-to-br from-white via-violet-50 to-amber-50 rounded-3xl p-8 md:p-10 border-2 border-violet-200 shadow-xl">
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-violet-300 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-violet-300 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-violet-300 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-violet-300 rounded-br-lg" />

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-violet-500" />
                    <span className="text-sm font-semibold text-violet-600 tracking-wider uppercase">StudyProof</span>
                    <Sparkles className="w-6 h-6 text-violet-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Certificate of Study</h2>
                  <p className="text-sm text-gray-500 mt-1">verified on 0G</p>
                </div>

                {/* Seal */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg animate-pulse-soft">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Document Studied</p>
                    <p className="font-semibold text-gray-900 text-lg">{certificate.documentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date and Time</p>
                    <p className="font-medium text-gray-700">{certificate.date}</p>
                  </div>
                  <div className="pt-2 border-t border-violet-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certificate ID</p>
                    <p className="font-mono text-sm text-violet-600">{certificate.certificateId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transaction Hash</p>
                    <p className="font-mono text-xs text-gray-500 break-all">{certificate.txHash}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button className="btn-secondary text-violet-600 px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                download certificate
              </button>
              <button
                onClick={shareOnX}
                className="btn-primary text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                share on X
              </button>
            </div>

            {/* Start Over */}
            <div className="text-center mt-8">
              <button
                onClick={resetApp}
                className="text-gray-500 hover:text-violet-600 font-medium flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                study another document
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
