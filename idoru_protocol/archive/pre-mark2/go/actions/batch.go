package actions

import (
    "context"
    "errors"

    "github.com/ava-labs/hypersdk/chain"
    "github.com/ava-labs/hypersdk/codec"
    "github.com/yourorg/idoru_protocol/go/consts"
    "github.com/yourorg/idoru_protocol/go/storage"
)

// AgentUpdate represents a single agent update in a batch
type AgentUpdate struct {
    AgentID []byte `serialize:"true"`
    Value   uint64 `serialize:"true"`
}

// SwarmBatch allows updating multiple agents in a single transaction
type SwarmBatch struct {
    Updates []AgentUpdate `serialize:"true"`
}

func (*SwarmBatch) GetTypeID() uint8 { return consts.BatchID }

func (sb *SwarmBatch) StateKeys(actor codec.Address, _ chain.ID) chain.Keys {
    keys := make(chain.Keys)
    for _, update := range sb.Updates {
        keys[string(storage.AgentKey(update.AgentID))] = chain.Read | chain.Write
    }
    return keys
}

func (sb *SwarmBatch) Execute(
    ctx context.Context,
    rules chain.Rules,
    mu chain.Mutable,
    now int64,
    actor codec.Address,
    txID chain.ID,
) (codec.Typed, error) {
    results := make([]ResonanceResult, 0, len(sb.Updates))
    
    for _, update := range sb.Updates {
        agent, err := storage.GetAgent(ctx, mu, update.AgentID)
        if err != nil {
            return nil, errors.New("failed to get agent state")
        }
        
        // Update logic - only update if new value is higher
        if update.Value > agent.Resonance {
            agent.Resonance = update.Value
        }
        
        // Clamp with resonanceMax if desired
        if agent.Resonance > 1000 {
            agent.Resonance = 1000
        }
        
        if err := storage.SetAgent(ctx, mu, update.AgentID, agent); err != nil {
            return nil, err
        }
        
        results = append(results, ResonanceResult{
            AgentID:  update.AgentID,
            NewValue: agent.Resonance,
        })
    }
    
    return &BatchResult{Results: results}, nil
}

// BatchResult contains the results of a batch update
type BatchResult struct {
    Results []ResonanceResult `serialize:"true"`
}

func (*BatchResult) GetTypeID() uint8 { return consts.BatchID } 