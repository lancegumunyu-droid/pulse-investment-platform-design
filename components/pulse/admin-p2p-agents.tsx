'use client'

import { useState } from 'react'
import { Send, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatAgent {
  id: string
  name: string
  email: string
  usdAllocated: number
  usdAvailable: number
  pulseAllocated: number
  pulseAvailable: number
  status: 'active' | 'inactive' | 'suspended'
}

export function AdminP2PAgents() {
  const [agents, setAgents] = useState<FloatAgent[]>([
    {
      id: '1',
      name: 'P2P Agent 1',
      email: 'agent1@pulse.com',
      usdAllocated: 100000,
      usdAvailable: 85000,
      pulseAllocated: 100000,
      pulseAvailable: 80000,
      status: 'active',
    },
  ])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [allocationAmount, setAllocationAmount] = useState<number>(0)
  const [allocationType, setAllocationType] = useState<'usd' | 'pulse'>('usd')

  const handleAllocate = () => {
    if (!selectedAgent || allocationAmount <= 0) return
    setAllocationAmount(0)
    setSelectedAgent(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">P2P Float Agents</h2>
          <p className="text-sm text-muted-foreground">Manage float allocations and agent transactions</p>
        </div>
        <Button className="bg-gold hover:bg-gold/90">
          <Plus className="mr-2 size-4" />
          Add Agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.email}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  agent.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : agent.status === 'suspended'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {agent.status}
              </span>
            </div>

            {/* Float Status */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-muted-foreground">USD Balance</p>
                <p className="mt-1 text-lg font-semibold">${agent.usdAvailable.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of ${agent.usdAllocated.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-muted-foreground">PULSE Tokens</p>
                <p className="mt-1 text-lg font-semibold">{agent.pulseAvailable.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of {agent.pulseAllocated.toLocaleString()}</p>
              </div>
            </div>

            {/* Allocation Form */}
            {selectedAgent === agent.id && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex gap-2">
                  <select
                    value={allocationType}
                    onChange={(e) => setAllocationType(e.target.value as 'usd' | 'pulse')}
                    className="rounded-lg border border-white/12 bg-white/[0.02] px-3 py-2 text-sm outline-none focus:border-gold/50"
                  >
                    <option value="usd">USD</option>
                    <option value="pulse">PULSE</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={allocationAmount || ''}
                    onChange={(e) => setAllocationAmount(Number(e.target.value))}
                    className="flex-1 rounded-lg border border-white/12 bg-white/[0.02] px-3 py-2 text-sm outline-none focus:border-gold/50"
                  />
                  <Button size="sm" onClick={handleAllocate} className="bg-gold hover:bg-gold/90">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {selectedAgent !== agent.id && (
              <Button
                variant="outline"
                className="w-full border-white/12 bg-white/[0.02]"
                onClick={() => setSelectedAgent(agent.id)}
              >
                Allocate Funds
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="mb-4 font-semibold">Recent Transactions (Pending Approval)</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-white/10 p-3">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium">Agent 1 → User transaction</p>
                <p className="text-xs text-muted-foreground">$50,000 USD</p>
              </div>
            </div>
            <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
