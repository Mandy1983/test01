import PizzaFractionGame from '@/components/PizzaFractionGame'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-white">
      {/* Italian Flag Colors Header */}
      <div className="h-2 bg-gradient-to-r from-green-600 via-white to-red-600"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6 shadow-lg">
            <span className="text-4xl">🍕</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Pizzeria Frazione
          </h1>
          
          <p className="text-xl text-red-700 font-medium mb-2">
            Benvenuti nella nostra pizzeria! 🇮🇹
          </p>
          
          <p className="text-lg text-gray-600">
            Leer breuken door pizza's te maken en te delen in onze Italiaanse pizzeria!
          </p>
        </div>

        {/* Game Component */}
        <PizzaFractionGame />

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 text-red-600">
            <span>🍕</span>
            <span>Buon appetito e buona fortuna!</span>
            <span>🍕</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Pizza Breuken Spel • Gemaakt met liefde voor wiskunde 🧮❤️
          </p>
        </div>
      </div>
    </div>
  )
}