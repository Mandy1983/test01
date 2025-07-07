'use client'

import { useState, useEffect } from 'react'

interface Fraction {
  numerator: number
  denominator: number
}

interface Question {
  fraction1: Fraction
  fraction2: Fraction
  operation: '+' | '-'
  answer: Fraction
}

interface PizzaSlice {
  id: number
  filled: boolean
  angle: number
  startAngle: number
}

export default function PizzaFractionGame() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState<Fraction>({ numerator: 0, denominator: 1 })
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [gameStarted, setGameStarted] = useState(false)

  // Available fractions for the game
  const fractions = [
    { numerator: 1, denominator: 2 },
    { numerator: 1, denominator: 3 },
    { numerator: 1, denominator: 4 },
    { numerator: 1, denominator: 5 },
    { numerator: 1, denominator: 8 },
    { numerator: 1, denominator: 10 }
  ]

  // Generate pizza slices for visualization
  const generatePizzaSlices = (denominator: number): PizzaSlice[] => {
    const slices: PizzaSlice[] = []
    const anglePerSlice = 360 / denominator
    
    for (let i = 0; i < denominator; i++) {
      slices.push({
        id: i,
        filled: false,
        angle: anglePerSlice,
        startAngle: i * anglePerSlice
      })
    }
    
    return slices
  }

  // Simplify fraction
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }

  const simplifyFraction = (fraction: Fraction): Fraction => {
    const divisor = gcd(Math.abs(fraction.numerator), fraction.denominator)
    return {
      numerator: fraction.numerator / divisor,
      denominator: fraction.denominator / divisor
    }
  }

  // Add fractions
  const addFractions = (f1: Fraction, f2: Fraction): Fraction => {
    const numerator = f1.numerator * f2.denominator + f2.numerator * f1.denominator
    const denominator = f1.denominator * f2.denominator
    return simplifyFraction({ numerator, denominator })
  }

  // Subtract fractions
  const subtractFractions = (f1: Fraction, f2: Fraction): Fraction => {
    const numerator = f1.numerator * f2.denominator - f2.numerator * f1.denominator
    const denominator = f1.denominator * f2.denominator
    return simplifyFraction({ numerator, denominator })
  }

  // Generate a new question
  const generateQuestion = (): Question => {
    const operation = Math.random() > 0.5 ? '+' : '-'
    let fraction1, fraction2
    
    if (difficulty === 'easy') {
      // Same denominators
      const denominator = [2, 4, 8][Math.floor(Math.random() * 3)]
      fraction1 = { numerator: 1, denominator }
      fraction2 = { numerator: 1, denominator }
    } else if (difficulty === 'medium') {
      // Different denominators, but related
      const pairs = [
        [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 }],
        [{ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 6 }],
        [{ numerator: 1, denominator: 4 }, { numerator: 1, denominator: 8 }],
        [{ numerator: 1, denominator: 5 }, { numerator: 1, denominator: 10 }]
      ]
      const pair = pairs[Math.floor(Math.random() * pairs.length)]
      fraction1 = pair[0]
      fraction2 = pair[1]
    } else {
      // Hard: any combination
      fraction1 = fractions[Math.floor(Math.random() * fractions.length)]
      fraction2 = fractions[Math.floor(Math.random() * fractions.length)]
    }

    // For subtraction, make sure result is positive
    if (operation === '-') {
      const result = subtractFractions(fraction1, fraction2)
      if (result.numerator <= 0) {
        [fraction1, fraction2] = [fraction2, fraction1]
      }
    }

    const answer = operation === '+' 
      ? addFractions(fraction1, fraction2)
      : subtractFractions(fraction1, fraction2)

    return { fraction1, fraction2, operation, answer }
  }

  // Start new question
  const startNewQuestion = () => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer({ numerator: 0, denominator: 1 })
    setFeedback('')
    setShowAnswer(false)
  }

  // Check answer
  const checkAnswer = () => {
    if (!currentQuestion) return

    const simplified = simplifyFraction(userAnswer)
    const correctAnswer = currentQuestion.answer

    if (simplified.numerator === correctAnswer.numerator && 
        simplified.denominator === correctAnswer.denominator) {
      setScore(score + 1)
      setFeedback('🎉 Perfetto! Ottima risposta!')
    } else {
      setFeedback(`❌ Non è corretto. La risposta giusta è ${correctAnswer.numerator}/${correctAnswer.denominator}`)
    }
    
    setTotalQuestions(totalQuestions + 1)
    setShowAnswer(true)
  }

  // Start game
  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setTotalQuestions(0)
    startNewQuestion()
  }

  // Pizza SVG Component
  const PizzaVisualization = ({ fraction, label }: { fraction: Fraction, label: string }) => {
    const slices = generatePizzaSlices(fraction.denominator)
    const filledSlices = fraction.numerator

    return (
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">{label}</h4>
        <div className="relative inline-block">
          <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-lg">
            {/* Pizza base */}
            <circle cx="60" cy="60" r="55" fill="#F4A460" stroke="#D2691E" strokeWidth="2"/>
            
            {/* Pizza slices */}
            {slices.map((slice, index) => {
              const startAngle = (slice.startAngle - 90) * (Math.PI / 180)
              const endAngle = (slice.startAngle + slice.angle - 90) * (Math.PI / 180)
              
              const x1 = 60 + 50 * Math.cos(startAngle)
              const y1 = 60 + 50 * Math.sin(startAngle)
              const x2 = 60 + 50 * Math.cos(endAngle)
              const y2 = 60 + 50 * Math.sin(endAngle)
              
              const largeArcFlag = slice.angle > 180 ? 1 : 0
              
              return (
                <g key={slice.id}>
                  {/* Slice separator */}
                  <line x1="60" y1="60" x2={x1} y2={y1} stroke="#8B4513" strokeWidth="1"/>
                  
                  {/* Filled slice (with toppings) */}
                  {index < filledSlices && (
                    <path
                      d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill="#FF6347"
                      opacity="0.8"
                    />
                  )}
                  
                  {/* Cheese dots */}
                  {index < filledSlices && (
                    <>
                      <circle cx={60 + 25 * Math.cos(startAngle + slice.angle * Math.PI / 360)} 
                              cy={60 + 25 * Math.sin(startAngle + slice.angle * Math.PI / 360)} 
                              r="2" fill="#FFFF99"/>
                      <circle cx={60 + 35 * Math.cos(startAngle + slice.angle * Math.PI / 360)} 
                              cy={60 + 35 * Math.sin(startAngle + slice.angle * Math.PI / 360)} 
                              r="1.5" fill="#90EE90"/>
                    </>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
        <p className="text-xl font-bold text-red-600 mt-2">
          {fraction.numerator}/{fraction.denominator}
        </p>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-red-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welkom in Pizzeria Frazione! 🍕
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Help onze Italiaanse chef-kok Mario met het verdelen van pizza's. 
              Leer breuken optellen en aftrekken door echte pizza's te maken!
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Kies je niveau:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setDifficulty('easy')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'easy' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-2">🟢</div>
                <div className="font-semibold">Facile</div>
                <div className="text-sm text-gray-600">Zelfde noemers</div>
              </button>
              
              <button
                onClick={() => setDifficulty('medium')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'medium' 
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                    : 'border-gray-300 hover:border-yellow-300'
                }`}
              >
                <div className="text-2xl mb-2">🟡</div>
                <div className="font-semibold">Medio</div>
                <div className="text-sm text-gray-600">Gerelateerde noemers</div>
              </button>
              
              <button
                onClick={() => setDifficulty('hard')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'hard' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <div className="text-2xl mb-2">🔴</div>
                <div className="font-semibold">Difficile</div>
                <div className="text-sm text-gray-600">Alle combinaties</div>
              </button>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg transform hover:scale-105"
            >
              🍕 Start het Spel! 🍕
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Score Board */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-2 border-green-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">👨‍🍳</div>
            <div>
              <div className="text-lg font-semibold text-gray-700">Chef Mario's Score</div>
              <div className="text-sm text-gray-500">Niveau: {difficulty === 'easy' ? 'Facile' : difficulty === 'medium' ? 'Medio' : 'Difficile'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{score}/{totalQuestions}</div>
            <div className="text-sm text-gray-500">Correcte antwoorden</div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-red-200">
        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pizza Bestelling #{totalQuestions + 1}
          </h2>
          <p className="text-lg text-gray-600">
            Hoeveel pizza krijgt de klant in totaal?
          </p>
        </div>

        {/* Pizza Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <PizzaVisualization 
            fraction={currentQuestion.fraction1} 
            label="Pizza 1" 
          />
          
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-red-600 mb-2">
                {currentQuestion.operation}
              </div>
              <div className="text-lg text-gray-600">
                {currentQuestion.operation === '+' ? 'plus' : 'min'}
              </div>
            </div>
          </div>
          
          <PizzaVisualization 
            fraction={currentQuestion.fraction2} 
            label="Pizza 2" 
          />
        </div>

        {/* Math Expression */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-gray-800 bg-gray-50 rounded-lg p-4 inline-block">
            <span className="text-red-600">{currentQuestion.fraction1.numerator}</span>
            <span className="text-gray-400">/</span>
            <span className="text-red-600">{currentQuestion.fraction1.denominator}</span>
            <span className="mx-4 text-blue-600">{currentQuestion.operation}</span>
            <span className="text-red-600">{currentQuestion.fraction2.numerator}</span>
            <span className="text-gray-400">/</span>
            <span className="text-red-600">{currentQuestion.fraction2.denominator}</span>
            <span className="mx-4 text-gray-600">=</span>
            <span className="text-green-600">?</span>
          </div>
        </div>

        {/* Answer Input */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
            <label className="text-lg font-semibold text-gray-700">Jouw antwoord:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={userAnswer.numerator || ''}
                onChange={(e) => setUserAnswer({...userAnswer, numerator: parseInt(e.target.value) || 0})}
                className="w-16 p-2 border-2 border-gray-300 rounded text-center text-lg font-bold"
                disabled={showAnswer}
              />
              <span className="text-2xl text-gray-400">/</span>
              <input
                type="number"
                min="1"
                value={userAnswer.denominator || ''}
                onChange={(e) => setUserAnswer({...userAnswer, denominator: parseInt(e.target.value) || 1})}
                className="w-16 p-2 border-2 border-gray-300 rounded text-center text-lg font-bold"
                disabled={showAnswer}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-6">
          {!showAnswer ? (
            <button
              onClick={checkAnswer}
              disabled={userAnswer.numerator === 0 || userAnswer.denominator === 0}
              className="px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              🍕 Controleer Antwoord
            </button>
          ) : (
            <button
              onClick={startNewQuestion}
              className="px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              🍕 Volgende Pizza
            </button>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`text-center p-4 rounded-lg mb-4 ${
            feedback.includes('Perfetto') 
              ? 'bg-green-100 border-2 border-green-300 text-green-800' 
              : 'bg-red-100 border-2 border-red-300 text-red-800'
          }`}>
            <div className="text-lg font-semibold">{feedback}</div>
            {showAnswer && (
              <div className="mt-2">
                <PizzaVisualization 
                  fraction={currentQuestion.answer} 
                  label="Correct Antwoord" 
                />
              </div>
            )}
          </div>
        )}

        {/* Italian Encouragement */}
        <div className="text-center text-gray-600 italic">
          <p>"La matematica è come cucinare - serve pazienza e precisione!" - Chef Mario 👨‍🍳</p>
        </div>
      </div>

      {/* Reset Game Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => setGameStarted(false)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          🏠 Terug naar Menu
        </button>
      </div>
    </div>
  )
}