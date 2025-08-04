import React, { useState } from 'react'
import LandingPage from './pages/LandingPage'
import OrderInputPage from './pages/OrderInputPage'
import OrderReviewPage from './pages/OrderReviewPage'
import FeeInputPage from './pages/FeeInputPage'
import SummaryPage from './pages/SummaryPage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [orderData, setOrderData] = useState({
    items: [],
    people: [],
    fees: { delivery: 0, service: 0, tip: 0, tax: 0 }
  })

  const steps = [
    { component: LandingPage, title: 'Welcome' },
    { component: OrderInputPage, title: 'Order Input' },
    { component: OrderReviewPage, title: 'Review & Assign' },
    { component: FeeInputPage, title: 'Fees & Tax' },
    { component: SummaryPage, title: 'Summary' }
  ]

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  const CurrentStepComponent = steps[currentStep].component

  return (
    <ErrorBoundary>
      <div className="App">
        <CurrentStepComponent 
          orderData={orderData}
          setOrderData={setOrderData}
          currentStep={currentStep}
          nextStep={nextStep}
          prevStep={prevStep}
          totalSteps={steps.length}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
