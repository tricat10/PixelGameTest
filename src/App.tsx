import { useState } from 'react';
import { Avatar } from './components/Avatar';

type GameState = 'menu' | 'loading' | 'submitting' | 'game' | 'results';

interface Question {
  id: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface Answer {
  id: string;
  answer: string;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [isPass, setIsPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
  const QUESTION_COUNT = import.meta.env.VITE_QUESTION_COUNT || 5;
  const PASS_THRESHOLD = import.meta.env.VITE_PASS_THRESHOLD || 3;

  const handleStart = async () => {
    if (!userId.trim()) {
      setErrorMsg('PLEASE ENTER ID!');
      return;
    }
    if (!GAS_URL) {
       setErrorMsg('GAS_URL is missing in .env!');
       return;
    }
    setErrorMsg('');
    setGameState('loading');
    
    try {
      const resp = await fetch(`${GAS_URL}?count=${QUESTION_COUNT}`, {
        method: 'GET',
      });
      const data = await resp.json();
      
      if (data.error) {
        setErrorMsg(`API ERROR: ${data.error}`);
        setGameState('menu');
        return;
      }
      
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setGameState('game');
    } catch (err: any) {
      setErrorMsg(`FETCH ERROR: ${err.message}`);
      setGameState('menu');
    }
  };

  const handleAnswer = async (option: string) => {
    const currentQ = questions[currentQuestionIndex];
    const newAnswers = [...answers, { id: currentQ.id, answer: option }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished answering, submit answers
      setGameState('submitting');
      try {
         // Use text/plain to avoid CORS preflight options issues
         const resp = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
               userId: userId,
               answers: newAnswers,
               threshold: PASS_THRESHOLD
            }),
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
         });
         const data = await resp.json();
         if (data.error) {
            setErrorMsg(`SUBMIT ERROR: ${data.error}`);
            setGameState('menu');
            return;
         }
         
         setScore(data.score);
         setIsPass(data.isPass);
         setGameState('results');
         
      } catch (err: any) {
         setErrorMsg(`SUBMIT ERROR: ${err.message}`);
         setGameState('menu');
      }
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setUserId('');
    setQuestions([]);
    setAnswers([]);
    setScore(0);
    setErrorMsg('');
  };

  return (
    <div className="app-container">
      {gameState === 'menu' && (
        <>
          <h1>PIXEL QUIZ</h1>
          <h2>INSERT COIN / ID</h2>
          <input 
            className="pixel-input"
            type="text" 
            placeholder="PLAYER ID..." 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          {errorMsg && <p style={{color: 'var(--secondary-color)', marginBottom: '10px'}}>{errorMsg}</p>}
          <button className="pixel-button" onClick={handleStart}>START GAME</button>
        </>
      )}

      {gameState === 'loading' && (
        <div className="loader">LOADING QUESTIONS...</div>
      )}

      {gameState === 'submitting' && (
        <div className="loader">CALCULATING SCORE...</div>
      )}

      {gameState === 'game' && questions.length > 0 && (
        <>
          <div className="status-bar">
             <span>PLAYER: {userId}</span>
             <span>Q: {currentQuestionIndex + 1} / {questions.length}</span>
          </div>
          {/* 使用題目的 id 作為種子，確保每題有專屬的關主 */}
          <Avatar seed={`boss-${questions[currentQuestionIndex].id}`} />
          <div className="question-text">
            {questions[currentQuestionIndex].text}
          </div>
          <div className="options-container">
             {['A', 'B', 'C', 'D'].map((opt) => (
                <button 
                  key={opt}
                  className="pixel-button" 
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}: {questions[currentQuestionIndex].options[opt as keyof Question['options']]}
                </button>
             ))}
          </div>
        </>
      )}

      {gameState === 'results' && (
        <>
          <h1>{isPass ? 'STAGE CLEARED!' : 'GAME OVER'}</h1>
          <Avatar seed={isPass ? 'win-avatar' : 'lose-avatar'} />
          <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.2rem' }}>
             <p>SCORE: {score} / {questions.length}</p>
             <p style={{ marginTop: '10px', color: isPass ? 'var(--primary-color)' : 'var(--secondary-color)' }}>
               {isPass ? 'YOU PASSED THE THRESHOLD!' : 'YOU FAILED... TRY AGAIN!'}
             </p>
          </div>
          <button className="pixel-button" onClick={resetGame}>PLAY AGAIN</button>
        </>
      )}
    </div>
  );
}
