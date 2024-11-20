"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, Brain, Zap, Clock, Lock, Layers, Search, Smartphone, Save, Send, Menu, X, Check, Twitter, Facebook, Instagram, Linkedin } from "lucide-react"

export default function ThinkNoteWebsite() {
  const [isRecording1, setIsRecording1] = useState(false)
  const [isRecording2, setIsRecording2] = useState(false)
  const [transcript1, setTranscript1] = useState("")
  const [transcript2, setTranscript2] = useState("")
  const [recordingTime1, setRecordingTime1] = useState(0)
  const [recordingTime2, setRecordingTime2] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const recognitionRef1 = useRef<SpeechRecognition | null>(null)
  const recognitionRef2 = useRef<SpeechRecognition | null>(null)
  const timerRef1 = useRef<NodeJS.Timeout | null>(null)
  const timerRef2 = useRef<NodeJS.Timeout | null>(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef1.current = new SpeechRecognitionAPI()
      recognitionRef1.current.continuous = true
      recognitionRef1.current.interimResults = true

      recognitionRef1.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          }
        }
        if (finalTranscript) {
          setTranscript1(prevTranscript => prevTranscript + finalTranscript)
        }
      }

      recognitionRef2.current = new SpeechRecognitionAPI()
      recognitionRef2.current.continuous = true
      recognitionRef2.current.interimResults = true

      recognitionRef2.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          }
        }
        if (finalTranscript) {
          setTranscript2(prevTranscript => prevTranscript + finalTranscript)
        }
      }
    }

    return () => {
      if (timerRef1.current) clearInterval(timerRef1.current)
      if (timerRef2.current) clearInterval(timerRef2.current)
    }
  }, [])

  const toggleRecording = (recordingNumber: number) => {
    if (recordingNumber === 1) {
      if (isRecording1) {
        stopRecording(1)
      } else {
        startRecording(1)
      }
    } else if (recordingNumber === 2) {
      if (isRecording2) {
        stopRecording(2)
      } else {
        startRecording(2)
      }
    }
  }

  const startRecording = (recordingNumber: number) => {
    if (recordingNumber === 1 && recognitionRef1.current) {
      recognitionRef1.current.start()
      setIsRecording1(true)
      timerRef1.current = setInterval(() => {
        setRecordingTime1((prevTime) => prevTime + 1)
      }, 1000)
    } else if (recordingNumber === 2 && recognitionRef2.current) {
      recognitionRef2.current.start()
      setIsRecording2(true)
      timerRef2.current = setInterval(() => {
        setRecordingTime2((prevTime) => prevTime + 1)
      }, 1000)
    }
  }

  const stopRecording = (recordingNumber: number) => {
    if (recordingNumber === 1 && recognitionRef1.current) {
      recognitionRef1.current.stop()
      setIsRecording1(false)
      if (timerRef1.current) clearInterval(timerRef1.current)
    } else if (recordingNumber === 2 && recognitionRef2.current) {
      recognitionRef2.current.stop()
      setIsRecording2(false)
      if (timerRef2.current) clearInterval(timerRef2.current)
    }
  }

  const saveTranscript = async () => {
    try {
      const combinedTranscript = `Transcript 1:\n${transcript1}\n\nTranscript 2:\n${transcript2}`
      const response = await fetch('/api/save-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: combinedTranscript }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'transcript.txt'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        alert('Transcript saved successfully!')
      } else {
        throw new Error('Failed to save transcript')
      }
    } catch (err) {
      console.error('Failed to save the file:', err)
      alert('Failed to save the transcript. Please try again.')
    }
  }

  const sendToLLM = async () => {
    try {
      const combinedTranscript = `Transcript 1:\n${transcript1}\n\nTranscript 2:\n${transcript2}`
      const response = await fetch('/api/process-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: combinedTranscript }),
      })

      if (response.ok) {
        const result = await response.json()
        const llmResponse = result.response

        const blob = new Blob([llmResponse], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'llm_response.txt'
        document.body.appendChild(a)
        a.click()

        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        alert('LLM response has been processed and downloaded.')
      } else {
        throw new Error('Failed to process transcript')
      }
    } catch (err) {
      console.error('Failed to process the transcript:', err)
      alert('Failed to process the transcript. Please try again.')
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-800">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-gray-800">ThinkNote</span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <a href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">How It Works</a>
              <a href="#pricing" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Pricing</a>
              <a href="#contact" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Contact</a>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">How It Works</a>
              <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Pricing</a>
              <a href="#contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Contact</a>
            </div>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        <div className="container mx-auto px-4 text-center z-10">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-900"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            ThinkNote
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-600"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Your AI-Powered Voice Note Companion
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <Card className="w-full max-w-2xl p-6 mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="flex flex-col items-center">
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-mono mb-2 text-gray-700">
                      {formatTime(recordingTime1)}
                    </div>
                    <Button
                      className={`w-24 h-24 rounded-full transition-all duration-300 ease-in-out mb-4 ${
                        isRecording1 ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950'
                      }`}
                      onClick={() => toggleRecording(1)}
                    >
                      <Mic className={`w-8 h-8 ${isRecording1 ? 'text-white' : 'text-gray-100'}`} />
                    </Button>
                    <p className="text-sm  mb-4 text-gray-500">
                      {isRecording1 ? "Click to stop" : "Click to record"}
                    </p>
                    <div className="w-full h-48 p-4 bg-gray-100 rounded-lg overflow-auto">
                      <p className="text-left">{transcript1}</p>
                    </div>
                  </div>
                  <div className="flex  flex-col items-center">
                    <div className="text-3xl font-mono mb-2 text-gray-700">
                      {formatTime(recordingTime2)}
                    </div>
                    <Button
                      className={`w-24 h-24 rounded-full transition-all duration-300 ease-in-out mb-4 ${
                        isRecording2 ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950'
                      }`}
                      onClick={() => toggleRecording(2)}
                    >
                      <Mic className={`w-8 h-8 ${isRecording2 ? 'text-white' : 'text-gray-100'}`} />
                    </Button>
                    <p className="text-sm mb-4 text-gray-500">
                      {isRecording2 ? "Click to stop" : "Click to record"}
                    </p>
                    <div className="w-full h-48 p-4 bg-gray-100 rounded-lg overflow-auto">
                      <p className="text-left">{transcript2}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <Button
                    className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white"
                    onClick={saveTranscript}
                    disabled={!transcript1 && !transcript2}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Transcript
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white"
                    onClick={sendToLLM}
                    disabled={!transcript1 && !transcript2}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Process with LLM
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-bold mb-16 text-center text-gray-800">Why ThinkNote?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Mic, title: "AI-Powered Voice to Text", description: "Convert your voice notes into searchable text instantly." },
              { icon: Zap, title: "Automatic Summarization", description: "Save time by letting AI highlight key points." },
              { icon: Layers, title: "Organize with Ease", description: "Smart tagging and categorization for effortless organization." },
              { icon: Smartphone, title: "Cross-Platform Availability", description: "Your notes are always where you need them." },
              { icon: Lock, title: "Privacy Guaranteed", description: "Your thoughts are yours alone – we keep it that way." },
              { icon: Brain, title: "AI that Understands You", description: "Let our AI be your intelligent note-taking assistant." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-white/70 backdrop-blur-md shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200">
                  <feature.icon className="w-12 h-12 text-gray-700 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-bold mb-16 text-center text-gray-800">How ThinkNote Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Capture", description: "Record your thoughts anytime, anywhere" },
              { step: 2, title: "Convert", description: "AI instantly transforms voice to text" },
              { step: 3, title: "Organize", description: "Smart categorization and tagging" },
              { step: 4, title: "Access", description: "Find and use your notes with ease" }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse animation-delay-2000"></div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-16 text-center text-gray-800">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Basic", price: "$9.99", features: ["100 voice-to-text conversions", "Basic AI summarization", "5GB storage"] },
              { name: "Pro", price: "$19.99", features: ["Unlimited voice-to-text", "Advanced AI summarization", "25GB storage", "Priority support"] },
              { name: "Enterprise", price: "Custom", features: ["Custom AI models", "Dedicated account manager", "Unlimited storage", "API access"] },
            ].map((plan, index) => (
              <Card key={index} className="flex flex-col">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-4xl font-bold mb-6">{plan.price}</p>
                  <ul className="mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="mb-2 flex items-center">
                        <Check className="w-5 h-5 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white">
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-16 text-center text-gray-800">Get in Touch</h2>
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-6">
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <Button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">ThinkNote</h3>
              <p className="text-gray-400">Your AI-Powered Voice Note Companion</p>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-gray-300">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-300">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-gray-300">Pricing</a></li>
                <li><a href="#contact" className="hover:text-gray-300">Contact</a></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-gray-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-300">Terms of Service</a></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4">
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-gray-300"><Twitter className="w-6 h-6" /></a>
                <a href="#" className="hover:text-gray-300"><Facebook className="w-6 h-6" /></a>
                <a href="#" className="hover:text-gray-300"><Instagram className="w-6 h-6" /></a>
                <a href="#" className="hover:text-gray-300"><Linkedin className="w-6 h-6" /></a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; 2023 ThinkNote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}