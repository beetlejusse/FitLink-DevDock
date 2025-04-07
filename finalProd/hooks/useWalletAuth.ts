import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'

export function useWalletAuth() {
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors, error: connectError, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (connectError) {
      setError(connectError.message)
    }
  }, [connectError])

  const handleConnect = async () => {
    try {
      setError(null)
      const connector = connectors[0]
      if (!connector) {
        throw new Error('Please install MetaMask or another Ethereum wallet')
      }
      await connectAsync({ connector })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    }
  }

  return {
    address,
    isConnected,
    connect: handleConnect,
    disconnect,
    error,
    isConnecting: isPending,
  }
}