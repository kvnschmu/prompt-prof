import { useState, useEffect, useMemo } from 'react';
import { Type, Search, Plus, Trash2, Edit2, Copy, Save } from 'lucide-react';
import { usePromptStore } from '../stores/promptStore';
import { useUIStore } from '../stores/uiStore';

export default function TextPrompts() {
  const { prompts, fetchPrompts, createPrompt, updatePrompt, deletePrompt } = usePromptStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchPrompts({ type: 'text' });
  }, [fetchPrompts]);

  const textPrompts = useMemo(() => 
    prompts.filter(p => p.type === 'text' && (
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.content.toLowerCase().includes(search.toLowerCase())
    )), 
  [prompts, search]);

  const handleAddNew = () => {
    setIsEditing('new');
    setEditForm({ title: 'Neuer Text Prompt', content: '' });
  };

  const handleSave = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      addToast({ title: 'Fehler', description: 'Titel und Inhalt dürfen nicht leer sein.', variant: 'error' });
      return;
    }

    if (isEditing === 'new') {
      await createPrompt({
        title: editForm.title,
        content: editForm.content,
        type: 'text',
        category: 'text-templates'
      });
    } else if (isEditing) {
      await updatePrompt(isEditing, editForm);
    }
    
    setIsEditing(null);
  };

  return (
    <div className="md:h-full flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Type className="text-white w-5 h-5" />
            </div>
            Rollen Prompt Maker
          </h1>
          <p className="text-muted-foreground mt-2">
            Verwalte und erstelle Text-Prompts für ChatGPT, Claude und andere LLMs.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Texte durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500/50 w-full sm:w-64"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="btn-primary py-2 px-4 shadow-none flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Neuer Prompt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 md:min-h-0">
        
        {/* List Column */}
        <div className="col-span-1 lg:col-span-1 glass-card p-0 flex flex-col border-blue-500/20">
          {textPrompts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Type className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>Keine Text Prompts gefunden.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {textPrompts.map(prompt => (
                <div 
                  key={prompt.id}
                  onClick={() => {
                    setIsEditing(prompt.id);
                    setEditForm({ title: prompt.title, content: prompt.content });
                  }}
                  className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${
                    isEditing === prompt.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <h4 className="font-semibold text-foreground mb-1 line-clamp-1">{prompt.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{prompt.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor Column */}
        <div className="col-span-1 lg:col-span-2 glass-card flex flex-col flex-1 border-indigo-500/20">
          {isEditing ? (
            <div className="flex flex-col h-full gap-4">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titel des Prompts"
                className="text-xl font-bold bg-transparent border-b border-border/50 pb-2 focus:outline-none focus:border-blue-500 text-foreground"
              />
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Inhalt deines Prompts. Unterstützt Variablen wie [Zielgruppe] oder [Format]..."
                className="flex-1 bg-black/20 rounded-lg p-4 resize-none border border-white/5 focus:outline-none focus:border-blue-500/50 text-foreground font-light leading-relaxed"
              />
              <div className="flex gap-3 justify-end pt-2">
                {isEditing !== 'new' && (
                  <button
                    onClick={() => {
                      if(window.confirm('Prompt wirklich löschen?')) {
                        deletePrompt(isEditing);
                        setIsEditing(null);
                      }
                    }}
                    className="btn-secondary text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10 px-4 flex items-center gap-2 mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Löschen</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(editForm.content);
                    addToast({ title: 'Kopiert', description: 'Prompt in die Zwischenablage kopiert', variant: 'success' });
                  }}
                  className="btn-secondary px-4 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Kopieren</span>
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary px-6 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Speichern</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/60 rounded-xl">
              <Edit2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">Editor</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Wähle einen Prompt aus der Liste oder erstelle einen neuen, um ihn hier zu bearbeiten.
              </p>
              <button
                onClick={handleAddNew}
                className="btn-secondary px-6"
              >
                Neuen Prompt erstellen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
