import { useEffect, useState, useRef } from 'react';
import type { Recipe, AiAssistantResponse } from '../types';
import { getRecipeImage } from '../utils/imageUtils';
import { askRecipeAssistant } from '../services/aiRecipeService';
import './RecipeDetails.css';

interface RecipeDetailsProps {
  recipe: Recipe;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export function RecipeDetails({ recipe, onClose, isSaved, onToggleSave, isLiked, onToggleLike }: RecipeDetailsProps) {
  const [aiResponse, setAiResponse] = useState<AiAssistantResponse | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleAiAsk = async (question?: string) => {
    const q = question || aiQuestion.trim();
    if (!q || isAiLoading) return;

    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const response = await askRecipeAssistant(recipe, q);
      setAiResponse(response);
    } catch {
      setAiResponse({ question: q, answer: 'Maaf, terjadi kesalahan. Coba lagi nanti.' });
    } finally {
      setIsAiLoading(false);
      setAiQuestion('');
    }
  };

  const quickQuestions = [
    'Bikin versi anak kos',
    'Bikin lebih hemat',
    'Bikin lebih sehat',
    'Bikin lebih pedas',
    'Kalau nggak ada bawang bombay?',
    'Bikin tanpa santan',
  ];

  const displayTime = recipe.cookingTime || recipe.cookTime || recipe.prepTime || '-';
  const displayLikes = (recipe.likes || 0) + (isLiked ? 1 : 0);
  const steps = recipe.steps?.length ? recipe.steps : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="close-btn glass" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="modal-hero">
          <img src={getRecipeImage(recipe)} alt={`${recipe.title} - Resep Racikin`} className="modal-image" />
          <div className="modal-hero-gradient"></div>
          <div className="modal-hero-content">
            <div className="modal-badges">
              <span className="modal-category">{recipe.category}</span>
              {recipe.isVerified && <span className="modal-verified">✓ Terverifikasi</span>}
            </div>
            <h2 className="modal-title">{recipe.title}</h2>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-actions-row">
            <div className="modal-meta-grid">
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span className="meta-text">{displayTime}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👨‍🍳</span>
                <span className="meta-text">{recipe.difficulty || 'Sedang'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🍽️</span>
                <span className="meta-text">{recipe.servings || '-'} Porsi</span>
              </div>
              {recipe.caloriesEstimate > 0 && (
                <div className="meta-item">
                  <span className="meta-icon">🔥</span>
                  <span className="meta-text">{recipe.caloriesEstimate} Kkal</span>
                </div>
              )}
              {(recipe.views || 0) > 0 && (
                <div className="meta-item">
                  <span className="meta-icon">👁️</span>
                  <span className="meta-text">{recipe.views}x dilihat</span>
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button className={`action-btn like-btn ${isLiked ? 'active' : ''}`} onClick={onToggleLike}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{displayLikes} Suka</span>
              </button>
              <button className={`action-btn save-btn ${isSaved ? 'active' : ''}`} onClick={onToggleSave}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                </svg>
                <span>{isSaved ? 'Tersimpan' : 'Simpan Resep'}</span>
              </button>
            </div>
          </div>

          {recipe.shortDescription && (
            <p className="modal-desc">{recipe.shortDescription}</p>
          )}

          <div className="recipe-grid-layout">
            <div className="recipe-ingredients">
              <h3>Bahan-bahan</h3>
              <ul className="ingredient-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>

              {recipe.tools && recipe.tools.length > 0 && (
                <div className="info-box tools">
                  <strong>🍳 Alat yang Dibutuhkan:</strong>
                  <ul>{recipe.tools.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}

              {recipe.alternativeIngredients && (
                <div className="info-box alternative">
                  <strong>💡 Opsi Ganti Bahan:</strong>
                  <p>{recipe.alternativeIngredients}</p>
                </div>
              )}
            </div>

            <div className="recipe-instructions">
              <h3>Cara Memasak</h3>
              <ol className="instruction-list">
                {steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              {recipe.tips && (
                <div className="info-box tips">
                  <strong>✨ Tips Racikin:</strong>
                  <p>{recipe.tips}</p>
                </div>
              )}
            </div>
          </div>

          {/* Source info (subtle) */}
          {recipe.sourceType === 'external' && recipe.sourceName && (
            <div className="recipe-source-info">
              <span>📋 Sumber: {recipe.sourceName}</span>
              {recipe.sourceUrl && (
                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">Lihat asli →</a>
              )}
            </div>
          )}

          {/* ─── Tanya Racikin AI Section ──────────────────── */}
          <div className="ai-assistant-section">
            <h3 className="ai-assistant-title">🤖 Tanya Racikin</h3>
            <p className="ai-assistant-desc">
              Ada pertanyaan tentang resep ini? Tanya aja!
            </p>

            <div className="ai-quick-questions">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  className="ai-quick-btn"
                  onClick={() => handleAiAsk(q)}
                  disabled={isAiLoading}
                >
                  {q}
                </button>
              ))}
            </div>

            <form className="ai-input-form" onSubmit={(e) => { e.preventDefault(); handleAiAsk(); }}>
              <input
                ref={aiInputRef}
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Tulis pertanyaanmu di sini..."
                className="ai-input"
                disabled={isAiLoading}
              />
              <button type="submit" className="ai-send-btn" disabled={isAiLoading || !aiQuestion.trim()}>
                {isAiLoading ? '⏳' : '➤'}
              </button>
            </form>

            {isAiLoading && (
              <div className="ai-response-card loading">
                <div className="ai-thinking">
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                  <span>Racikin sedang berpikir...</span>
                </div>
              </div>
            )}

            {aiResponse && !isAiLoading && (
              <div className="ai-response-card animate-fade-in">
                <div className="ai-response-question">
                  <strong>Kamu:</strong> {aiResponse.question}
                </div>
                <div className="ai-response-answer">
                  <strong>Racikin AI:</strong> {aiResponse.answer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
