'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PaymentState {
  isPaid: boolean
  orderData: OrderData | null
  paymentStatus: 'pending' | 'verified' | 'rejected' | null
  auditResult: AuditResult | null
}

interface OrderData {
  name: string
  email: string
  company: string
  phone: string
  auditType: string
  package: string
  price: number
  document?: File | null
}

interface AuditResult {
  id: string
  date: string
  type: string
  summary: string
  findings: Finding[]
  recommendations: string[]
  actionItems: ActionItem[]
}

interface Finding {
  id: string
  title: string
  severity: 'High' | 'Medium' | 'Low'
  description: string
  impact: string
}

interface ActionItem {
  id: string
  task: string
  priority: 'High' | 'Medium' | 'Low'
  deadline: string
}

interface PaymentContextType {
  paymentState: PaymentState
  setOrderData: (data: OrderData) => void
  setPaymentStatus: (status: 'pending' | 'verified' | 'rejected') => void
  setAuditResult: (result: AuditResult) => void
  resetPayment: () => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentState, setPaymentState] = useState<PaymentState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paymentState')
      return saved ? JSON.parse(saved) : {
        isPaid: false,
        orderData: null,
        paymentStatus: null,
        auditResult: null,
      }
    }
    return {
      isPaid: false,
      orderData: null,
      paymentStatus: null,
      auditResult: null,
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('paymentState', JSON.stringify(paymentState))
    }
  }, [paymentState])

  const setOrderData = (data: OrderData) => {
    setPaymentState(prev => ({ ...prev, orderData: data }))
  }

  const setPaymentStatus = (status: 'pending' | 'verified' | 'rejected') => {
    setPaymentState(prev => ({
      ...prev,
      paymentStatus: status,
      isPaid: status === 'verified',
    }))
  }

  const setAuditResult = (result: AuditResult) => {
    setPaymentState(prev => ({ ...prev, auditResult: result }))
  }

  const resetPayment = () => {
    setPaymentState({
      isPaid: false,
      orderData: null,
      paymentStatus: null,
      auditResult: null,
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paymentState')
    }
  }

  return (
    <PaymentContext.Provider
      value={{
        paymentState,
        setOrderData,
        setPaymentStatus,
        setAuditResult,
        resetPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}

