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
  const [userNumerator, setUserNumerator] = useState<string>('')
  const [userDenominator, setUserDenominator] = useState<string>('')
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [simplificationExplanation, setSimplificationExplanation] = useState<string>('')
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

  // Check if two fractions are equal
  const fractionsEqual = (f1: Fraction, f2: Fraction): boolean => {
    const s1 = simplifyFraction(f1)
    const s2 = simplifyFraction(f2)
    return s1.numerator === s2.numerator && s1.denominator === s2.denominator
  }

  // Generate simplification explanation (only when needed)
  const generateSimplificationExplanation = (question: Question, userAnswer: Fraction): string => {
    const { fraction1, fraction2, operation, answer } = question
    
    // Calculate the unsimplified result
    let unsimplifiedResult: Fraction
    if (fraction1.denominator === fraction2.denominator) {
      // Same denominators
      if (operation === '+') {
        unsimplifiedResult = { numerator: fraction1.numerator + fraction2.numerator, denominator: fraction1.denominator }
      } else {
        unsimplifiedResult = { numerator: fraction1.numerator - fraction2.numerator, denominator: fraction1.denominator }
      }
    } else {
      // Different denominators
      const commonDenom = fraction1.denominator * fraction2.denominator
      const newNum1 = fraction1.numerator * fraction2.denominator
      const newNum2 = fraction2.numerator * fraction1.denominator
      
      if (operation === '+') {
        unsimplifiedResult = { numerator: newNum1 + newNum2, denominator: commonDenom }
      } else {
        unsimplifiedResult = { numerator: newNum1 - newNum2, denominator: commonDenom }
      }
    }
    
    // Check if simplification happened
    const simplified = simplifyFraction(unsimplifiedResult)
    
    if (simplified.numerator !== unsimplifiedResult.numerator || simplified.denominator !== unsimplifiedResult.denominator) {
      const divisor = gcd(Math.abs(unsimplifiedResult.numerator), unsimplifiedResult.denominator)
      return `✨ **Vereenvoudigd:** ${unsimplifiedResult.numerator}/${unsimplifiedResult.denominator} werd ${simplified.numerator}/${simplified.denominator} (gedeeld door ${divisor})`
    }
    
    return ''
  }

  // Generate a new question
  const generateQuestion = (): Question => {
    let attempts = 0
    let question: Question
    
    do {
      attempts++
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
        
        // Sometimes swap them for variety
        if (Math.random() > 0.5) {
          [fraction1, fraction2] = [fraction2, fraction1]
        }
      } else {
        // Hard: any combination
        fraction1 = fractions[Math.floor(Math.random() * fractions.length)]
        fraction2 = fractions[Math.floor(Math.random() * fractions.length)]
      }

      // For subtraction, make sure result is positive and not zero
      if (operation === '-') {
        const result = subtractFractions(fraction1, fraction2)
        if (result.numerator <= 0) {
          [fraction1, fraction2] = [fraction2, fraction1]
        }
      }

      const answer = operation === '+' 
        ? addFractions(fraction1, fraction2)
        : subtractFractions(fraction1, fraction2)

      question = { fraction1, fraction2, operation, answer }
      
      // Check if answer is zero (which we want to avoid)
      const isZeroAnswer = answer.numerator === 0
      
      // Check if it's the same fraction being subtracted (like 1/4 - 1/4)
      const isSameFractionSubtraction = operation === '-' && 
        fractionsEqual(fraction1, fraction2)
      
      // If it's a valid question (not zero answer and not same fraction subtraction), break
      if (!isZeroAnswer && !isSameFractionSubtraction) {
        break
      }
      
    } while (attempts < 50) // Prevent infinite loop

    return question
  }

  // Start new question
  const startNewQuestion = () => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserNumerator('')
    setUserDenominator('')
    setFeedback('')
    setSimplificationExplanation('')
    setShowAnswer(false)
  }

  // Check answer
  const checkAnswer = () => {
    if (!currentQuestion) return

    const userAnswer: Fraction = {
      numerator: parseInt(userNumerator) || 0,
      denominator: parseInt(userDenominator) || 1
    }

    const simplified = simplifyFraction(userAnswer)
    const correctAnswer = currentQuestion.answer

    if (simplified.numerator === correctAnswer.numerator && 
        simplified.denominator === correctAnswer.denominator) {
      setScore(score + 1)
      setFeedback('🎉 Perfetto! Ottima risposta!')
      
      // Generate simplification explanation if needed
      const explanation = generateSimplificationExplanation(currentQuestion, userAnswer)
      setSimplificationExplanation(explanation)
    } else {
      setFeedback(`❌ Non è corretto. Het juiste antwoord is ${correctAnswer.numerator}/${correctAnswer.denominator}`)
      
      // Always show simplification explanation for wrong answers
      const explanation = generateSimplificationExplanation(currentQuestion, userAnswer)
      setSimplificationExplanation(explanation)
    }
    
    setTotalQuestions(totalQuestions + 1)
    setShowAnswer(true)
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAnswer && userNumerator && userDenominator) {
      checkAnswer()
    }
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

  // Pizza Icon Component for difficulty levels
  const PizzaIcon = ({ type }: { type: 'slice' | 'half' | 'whole' }) => {
    if (type === 'slice') {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto">
          {/* Pizza slice */}
          <path d="M20 20 L35 10 A 20 20 0 0 1 35 30 Z" fill="#F4A460" stroke="#D2691E" strokeWidth="1"/>
          <path d="M20 20 L35 10 A 20 20 0 0 1 35 30 Z" fill="#FF6347" opacity="0.7"/>
          <circle cx="28" cy="20" r="1.5" fill="#FFFF99"/>
          <circle cx="30" cy="25" r="1" fill="#90EE90"/>
        </svg>
      )
    } else if (type === 'half') {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto">
          {/* Half pizza */}
          <circle cx="20" cy="20" r="18" fill="#F4A460" stroke="#D2691E" strokeWidth="1"/>
          <path d="M20 2 A 18 18 0 0 1 20 38 Z" fill="#FF6347" opacity="0.7"/>
          <line x1="20" y1="2" x2="20" y2="38" stroke="#8B4513" strokeWidth="1"/>
          <circle cx="26" cy="15" r="1.5" fill="#FFFF99"/>
          <circle cx="28" cy="25" r="1" fill="#90EE90"/>
          <circle cx="24" cy="30" r="1" fill="#FF69B4"/>
        </svg>
      )
    } else {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto">
          {/* Whole pizza */}
          <circle cx="20" cy="20" r="18" fill="#F4A460" stroke="#D2691E" strokeWidth="1"/>
          <circle cx="20" cy="20" r="16" fill="#FF6347" opacity="0.7"/>
          {/* Pizza lines */}
          <line x1="20" y1="4" x2="20" y2="36" stroke="#8B4513" strokeWidth="1"/>
          <line x1="4" y1="20" x2="36" y2="20" stroke="#8B4513" strokeWidth="1"/>
          <line x1="7" y1="7" x2="33" y2="33" stroke="#8B4513" strokeWidth="1"/>
          <line x1="33" y1="7" x2="7" y2="33" stroke="#8B4513" strokeWidth="1"/>
          {/* Toppings */}
          <circle cx="15" cy="12" r="1.5" fill="#FFFF99"/>
          <circle cx="25" cy="15" r="1" fill="#90EE90"/>
          <circle cx="28" cy="25" r="1.5" fill="#FF69B4"/>
          <circle cx="12" cy="28" r="1" fill="#FFFF99"/>
          <circle cx="20" cy="25" r="1" fill="#90EE90"/>
        </svg>
      )
    }
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
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                  difficulty === 'easy' 
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-lg' 
                    : 'border-gray-300 hover:border-green-300 hover:shadow-md'
                }`}
              >
                <div className="mb-3">
                  <PizzaIcon type="slice" />
                </div>
                <div className="font-bold text-lg">Gemakkelijk</div>
                <div className="text-sm text-gray-600 mt-2">Zelfde noemers</div>
                <div className="text-xs text-gray-500 mt-1">1/4 + 1/4, 1/8 + 1/8</div>
              </button>
              
              <button
                onClick={() => setDifficulty('medium')}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                  difficulty === 'medium' 
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-lg' 
                    : 'border-gray-300 hover:border-yellow-300 hover:shadow-md'
                }`}
              >
                <div className="mb-3">
                  <PizzaIcon type="half" />
                </div>
                <div className="font-bold text-lg">Medium</div>
                <div className="text-sm text-gray-600 mt-2">Gerelateerde noemers</div>
                <div className="text-xs text-gray-500 mt-1">1/2 + 1/4, 1/5 + 1/10</div>
              </button>
              
              <button
                onClick={() => setDifficulty('hard')}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                  difficulty === 'hard' 
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-lg' 
                    : 'border-gray-300 hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div className="mb-3">
                  <PizzaIcon type="whole" />
                </div>
                <div className="font-bold text-lg">Moeilijk</div>
                <div className="text-sm text-gray-600 mt-2">Alle combinaties</div>
                <div className="text-xs text-gray-500 mt-1">1/3 + 1/8, 1/5 - 1/10</div>
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
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>Niveau:</span>
                <div className="flex items-center space-x-1">
                  {difficulty === 'easy' && <PizzaIcon type="slice" />}
                  {difficulty === 'medium' && <PizzaIcon type="half" />}
                  {difficulty === 'hard' && <PizzaIcon type="whole" />}
                  <span className="ml-1">
                    {difficulty === 'easy' ? 'Gemakkelijk' : difficulty === 'medium' ? 'Medium' : 'Moeilijk'}
                  </span>
                </div>
              </div>
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
            <label className="text-lg font-semibold text-gray-700">Typ je antwoord:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={userNumerator}
                onChange={(e) => setUserNumerator(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                className="w-20 p-3 border-2 border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:outline-none"
                disabled={showAnswer}
                autoFocus
              />
              <span className="text-3xl text-gray-400">/</span>
              <input
                type="number"
                min="1"
                value={userDenominator}
                onChange={(e) => setUserDenominator(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="1"
                className="w-20 p-3 border-2 border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:outline-none"
                disabled={showAnswer}
              />
            </div>
            <div className="text-sm text-gray-500">
              (Druk Enter om te controleren)
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-6">
          {!showAnswer ? (
            <button
              onClick={checkAnswer}
              disabled={!userNumerator || !userDenominator}
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
              <div className="mt-4">
                <PizzaVisualization 
                  fraction={currentQuestion.answer} 
                  label="Correct Antwoord" 
                />
              </div>
            )}
          </div>
        )}

        {/* Simplification Explanation (only when needed) */}
        {simplificationExplanation && showAnswer && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-blue-800 font-bold text-lg mb-2 flex items-center">
              <span className="text-2xl mr-2">🧮</span>
              Uitleg van Chef Mario
            </div>
            <div className="text-blue-700 text-lg">
              {simplificationExplanation}
            </div>
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