import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { QrCode, Key, Camera, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export default function CheckInPage() {
  const navigate = useNavigate()
  const { createSession } = useSession()
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [templeCode, setTempleCode] = useState('')

  const handleContinue = () => {
    if (selectedMethod === 'qr') {
      // For QR code, use a default temple code (in production, QR would contain temple code)
      const defaultTempleCode = 'TEMPLE_001'
      createSession(defaultTempleCode, 'qr')
      navigate('/home')
    } else if (selectedMethod === 'code' && templeCode.trim()) {
      // For manual code entry, use the entered code
      createSession(templeCode.trim().toUpperCase(), 'code')
      navigate('/home')
    }
  }

  return (
    <Layout show3D>
      <div className="min-h-screen px-4 py-8 md:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2">
              FaithGuard
            </h1>
            <p className="text-lg text-[#475569] mb-4 font-medium">Temple Check-In</p>
            <p className="text-[#475569] text-base md:text-lg">
              Choose one way to enter the temple system.
            </p>
          </motion.div>

          {/* Options */}
          <div className="space-y-6 mb-8">
            {/* QR Code Option */}
            <motion.div variants={itemVariants}>
              <Card
                selected={selectedMethod === 'qr'}
                onClick={() => setSelectedMethod('qr')}
                className="text-center relative overflow-hidden"
              >
                {selectedMethod === 'qr' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#F59E0B]" />
                  </motion.div>
                )}
                <div className="flex flex-col items-center space-y-5">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FDBA74]/20 to-[#F59E0B]/20 flex items-center justify-center shadow-lg"
                  >
                    <QrCode className="w-10 h-10 text-[#F59E0B]" strokeWidth={2} />
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-[#1E293B]">
                    Scan QR Code
                  </h2>
                  <p className="text-[#475569] text-base max-w-sm">
                    Scan the QR displayed at the temple entrance.
                  </p>
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedMethod('qr')
                    }}
                    className="w-full max-w-xs mt-2"
                  >
                    <Camera className="w-4 h-4 mr-2 inline" />
                    Open Camera
                  </Button>

                  {/* Camera Preview */}
                  <AnimatePresence>
                    {selectedMethod === 'qr' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white overflow-hidden"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex justify-center mb-4"
                        >
                          <Camera className="w-16 h-16 opacity-60" />
                        </motion.div>
                        <p className="text-sm mb-2 font-medium">
                          Camera will open here to scan QR code
                        </p>
                        <p className="text-xs text-gray-400">
                          Camera access will be requested.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 my-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm text-gray-400 font-semibold px-4">OR</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent"></div>
            </motion.div>

            {/* Code Option */}
            <motion.div variants={itemVariants}>
              <Card
                selected={selectedMethod === 'code'}
                onClick={() => setSelectedMethod('code')}
                className="text-center relative overflow-hidden"
              >
                {selectedMethod === 'code' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#F59E0B]" />
                  </motion.div>
                )}
                <div className="flex flex-col items-center space-y-5">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FDBA74]/20 to-[#F59E0B]/20 flex items-center justify-center shadow-lg"
                  >
                    <Key className="w-10 h-10 text-[#F59E0B]" strokeWidth={2} />
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-[#1E293B]">
                    Enter Temple Code
                  </h2>
                  <p className="text-[#475569] text-base max-w-sm">
                    Manually enter the unique temple code.
                  </p>
                  <Input
                    placeholder="Enter temple code"
                    value={templeCode}
                    onChange={(e) => {
                      setTempleCode(e.target.value)
                      setSelectedMethod('code')
                    }}
                    className="max-w-xs text-center font-mono"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (templeCode) setSelectedMethod('code')
                    }}
                    className="w-full max-w-xs mt-2"
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Continue Button */}
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              disabled={!selectedMethod || (selectedMethod === 'code' && !templeCode)}
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 shadow-xl"
            >
              Enter Temple
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Trust Footer */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-gray-400 mt-8"
          >
            No login • No tracking • Temporary access only
          </motion.p>
        </motion.div>
      </div>
    </Layout>
  )
}